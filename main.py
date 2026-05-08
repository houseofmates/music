from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from database import create_db_and_tables
from config import settings
import logging
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from collections import defaultdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Constants
RATE_LIMIT_REQUESTS = 300  # 300 requests per minute = 5 per second
RATE_LIMIT_WINDOW = 60  # seconds

# Global file watcher state
file_watcher_thread = None
file_watcher_stop_event = None


def _ensure_music_directory_exists():
    """Ensure the music directory exists, creating it if necessary."""
    music_dir = Path(settings.music_dir)
    if not music_dir.exists():
        logging.info("Music directory does not exist: %s, creating...", music_dir)
        music_dir.mkdir(parents=True, exist_ok=True)
    return music_dir


def _perform_initial_lowercase_pass(music_dir: Path):
    """Perform initial lowercase pass on music directory."""
    from file_watcher import initial_lowercase_pass
    logging.info("Performing initial lowercase pass...")
    initial_lowercase_pass(music_dir)


def _setup_file_watcher(music_dir: Path):
    """Setup and start the file watcher observer."""
    from file_watcher import MusicFileHandler
    from watchdog.observers import Observer

    event_handler = MusicFileHandler(str(music_dir))
    observer = Observer()
    observer.schedule(event_handler, str(music_dir), recursive=True)
    observer.start()
    return observer, event_handler


async def _perform_initial_scan_async(music_dir: Path):
    """Perform the initial directory scan asynchronously."""
    from sqlmodel import Session
    from database import engine
    from services import LibraryService

    try:
        with Session(engine) as session:
            scan_log = await LibraryService.scan_directory_async(
                session,
                str(music_dir),
                full_scan=True
            )
            logging.info("Initial scan complete: %d tracks found", scan_log.tracks_added)
    except (OSError, RuntimeError) as e:
        logging.error("Error during initial scan: %s", e)


def _start_async_initial_scan(music_dir: Path):
    """Start the initial scan in a separate thread."""
    import threading
    import asyncio

    def run_async_scan():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(_perform_initial_scan_async(music_dir))
        finally:
            loop.close()

    scan_thread = threading.Thread(target=run_async_scan, daemon=True)
    scan_thread.start()


def _monitor_file_changes(observer, event_handler):
    """Monitor file changes and handle pending scans."""
    try:
        while file_watcher_stop_event and not file_watcher_stop_event.is_set():
            time.sleep(1)
            # Check for pending scans (cooldown handling)
            if event_handler.pending_scan:
                current_time = time.time()
                if current_time - event_handler.last_scan_time >= event_handler.scan_cooldown:
                    try:
                        event_handler._perform_scan()
                    except (OSError, RuntimeError) as scan_e:
                        logging.error("Error performing pending scan: %s", scan_e)
    except RuntimeError as e:
        logging.error("File watcher error: %s", e)
    finally:
        observer.stop()
        observer.join()
        logging.info("File watcher stopped")


def run_file_watcher_async():
    """Run the file watcher with async initial scan to prevent blocking."""
    from file_watcher import MusicFileHandler
    from watchdog.observers import Observer
    from sqlmodel import Session
    from database import engine
    from services import LibraryService

    music_dir = _ensure_music_directory_exists()
    logging.info("File watcher starting for: %s", music_dir)

    _perform_initial_lowercase_pass(music_dir)

    observer, event_handler = _setup_file_watcher(music_dir)
    
    logging.info("File watcher started - performing async initial scan...")

    _start_async_initial_scan(music_dir)
    
    logging.info("File watcher monitoring for changes...")

    _monitor_file_changes(observer, event_handler)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown."""
    global file_watcher_thread, file_watcher_stop_event
    
    # Startup
    create_db_and_tables()
    logging.info("Database initialized")
    logging.info("Music directory: %s", settings.music_dir)
    
    # Mark any stale "running" scans as failed (from previous crashes)
    try:
        from sqlmodel import Session, select
        from database import engine
        from models_minimal import ScanLog
        with Session(engine) as session:
            stmt = select(ScanLog).where(ScanLog.status == "running")
            for scan in session.exec(stmt):
                scan.status = "failed"
                scan.errors = "Scan was interrupted (app restarted while scan was running)"
                scan.completed_at = datetime.now(timezone.utc)
                session.add(scan)
            session.commit()
            logging.info("Marked stale running scans as failed")
    except (OSError, RuntimeError) as e:
        logging.warning("Could not clean up stale scans: %s", e)
    
    # Start file watcher in background thread with non-blocking initial scan
    file_watcher_stop_event = threading.Event()
    file_watcher_thread = threading.Thread(target=run_file_watcher_async, daemon=True)
    file_watcher_thread.start()
    logging.info("File watcher started (async mode)")
    
    logging.info("%s %s started on port %d", settings.app_name, settings.app_version, settings.port)
    
    yield
    
    # Shutdown
    logging.info("Stopping file watcher...")
    if file_watcher_stop_event:
        file_watcher_stop_event.set()
    if file_watcher_thread and file_watcher_thread.is_alive():
        file_watcher_thread.join(timeout=5)
        if file_watcher_thread.is_alive():
            logging.warning("File watcher thread did not terminate within 5s")
    logging.info("%s shutting down", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    # Only send HSTS over HTTPS connections
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Rate limiting middleware (sliding window with cleanup)
# Uses a deque-based approach for O(1) per request instead of O(n) list filtering
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
_last_cleanup = time.time()


def _prune_single_ip(entries: list[float], window_start: float) -> list[float]:
    """Trim stale entries from the front of a sorted list in O(k) where k=stale entries."""
    cut = 0
    for t in entries:
        if t > window_start:
            break
        cut += 1
    if cut > 0:
        del entries[:cut]
    return entries


def _cleanup_rate_limit_store():
    """Clean up old entries from rate limit store periodically."""
    global _last_cleanup
    now = time.time()
    if now - _last_cleanup < 300:  # Clean up every 5 minutes
        return

    _last_cleanup = now
    window_start = now - RATE_LIMIT_WINDOW
    cleaned_count = 0

    stale_ips = []
    for ip, entries in _rate_limit_store.items():
        old_len = len(entries)
        _prune_single_ip(entries, window_start)
        cleaned_count += old_len - len(entries)
        if not entries:
            stale_ips.append(ip)

    for ip in stale_ips:
        del _rate_limit_store[ip]

    if cleaned_count > 0:
        logging.debug(f"Cleaned up {cleaned_count} old rate limit entries")


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if settings.debug:
        return await call_next(request)

    # Respect X-Forwarded-For when behind a trusted proxy, but fall back safely.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # X-Forwarded-For can be a comma-separated list; use the leftmost (original client).
        client_ip = forwarded.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW

    # Periodic cleanup (non-blocking, short-circuit check)
    _cleanup_rate_limit_store()

    entries = _rate_limit_store[client_ip]

    # O(1) prune stale entries from front (entries are appended in time order)
    _prune_single_ip(entries, window_start)

    if len(entries) >= RATE_LIMIT_REQUESTS:
        retry_after = int(RATE_LIMIT_WINDOW - (now - entries[0]))
        logging.warning(f"Rate limit exceeded for IP {client_ip}: {len(entries)} requests in window")
        return JSONResponse(
            status_code=429,
            content={"detail": f"Too many requests. Please try again in {retry_after} seconds."},
            headers={"Retry-After": str(retry_after)},
        )

    entries.append(now)

    try:
        response = await call_next(request)
        return response
    except (aiohttp.ClientError, OSError, ValueError) as e:
        logging.error("Error processing request %s from %s: %s", request.url.path, client_ip, e)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )


# Include routers
from routes_minimal import router as minimal_router
app.include_router(minimal_router, prefix="/api")
from radio_routes import router as radio_router
from analytics_routes import router as analytics_router
app.include_router(radio_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "status": "running"
    }


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
