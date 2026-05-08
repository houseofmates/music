#!/usr/bin/env python3
"""
Auto-commit system for the music app.
Watches for file changes and commits them automatically after 10 seconds of inactivity.
"""

import time
import logging
import subprocess
import sys
from pathlib import Path
from threading import Timer
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auto_commit.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class AutoCommitHandler(FileSystemEventHandler):
    def __init__(self, repo_path: Path, timeout: float = 10.0):
        self.repo_path = repo_path
        self.timeout = timeout
        self.timer: Timer = None
        self.last_commit_time = time.time()

    def on_any_event(self, event):
        # Ignore directory events and hidden files
        if event.is_directory or event.src_path.startswith('.'):
            return

        # Check if file is in gitignore
        if self._is_ignored(event.src_path):
            return

        logger.info(f"File change detected: {event.src_path}")
        self._reset_timer()

    def _is_ignored(self, file_path: str) -> bool:
        """Check if file is ignored by git."""
        try:
            result = subprocess.run(
                ['git', 'check-ignore', file_path],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except subprocess.CalledProcessError:
            return False

    def _reset_timer(self):
        if self.timer:
            self.timer.cancel()
        self.timer = Timer(self.timeout, self._commit_changes)
        self.timer.start()

    def _commit_changes(self):
        try:
            # Check if there are changes to commit
            result = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            if not result.stdout.strip():
                logger.info("No changes to commit")
                return

            # Add all changes
            subprocess.run(['git', 'add', '.'], cwd=self.repo_path, check=True)

            # Commit with timestamp
            commit_message = f"Auto-commit: changes detected at {time.strftime('%Y-%m-%d %H:%M:%S')}"
            subprocess.run(['git', 'commit', '-m', commit_message], cwd=self.repo_path, check=True)

            # Push to remote
            subprocess.run(['git', 'push', 'origin', 'main'], cwd=self.repo_path, check=True)

            logger.info("Changes committed and pushed successfully")
            self.last_commit_time = time.time()

        except subprocess.CalledProcessError as e:
            logger.error(f"Git command failed: {e}")
        except Exception as e:
            logger.error(f"Unexpected error during commit: {e}")

def main():
    repo_path = Path(__file__).parent
    if not (repo_path / '.git').exists():
        logger.error("Not a git repository")
        sys.exit(1)

    event_handler = AutoCommitHandler(repo_path)
    observer = Observer()
    observer.schedule(event_handler, str(repo_path), recursive=True)
    observer.start()

    logger.info("Auto-commit system started. Watching for changes...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        if event_handler.timer:
            event_handler.timer.cancel()
        logger.info("Auto-commit system stopped")
    observer.join()

if __name__ == "__main__":
    main()