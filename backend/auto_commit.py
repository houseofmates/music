#!/usr/bin/env python3
"""
auto-commit system for the music app.
watches for file changes and commits them automatically.
fixed version to prevent feedback loops and high cpu usage.
"""

import time
import logging
import subprocess
import sys
from pathlib import Path
from threading import Timer
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# configure logging
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
        self.repo_path = repo_path.resolve()
        self.timeout = timeout
        self.timer = None
        # identify the log file specifically to ignore it
        self.log_file = (self.repo_path / 'auto_commit.log').resolve()

    def on_any_event(self, event):
        if event.is_directory:
            return

        # resolve the absolute path for comparison
        path = Path(event.src_path).resolve()

        # stop the feedback loop: ignore the .git folder and the log file
        if '.git' in path.parts or path == self.log_file:
            return

        # ignore hidden files that aren't in the .git folder
        if path.name.startswith('.'):
            return

        # silent check for gitignore status
        if self._is_ignored(str(path)):
            return

        logger.info(f"change detected: {path.name}")
        self._reset_timer()

    def _is_ignored(self, file_path: str) -> bool:
        """check if file is ignored by git without spawning heavy processes."""
        try:
            result = subprocess.run(
                ['git', 'check-ignore', '-q', file_path],
                cwd=self.repo_path,
                capture_output=True
            )
            return result.returncode == 0
        except Exception:
            return False

    def _reset_timer(self):
        if self.timer:
            self.timer.cancel()
        self.timer = Timer(self.timeout, self._commit_changes)
        self.timer.start()

    def _commit_changes(self):
        try:
            # only proceed if there are actual changes
            result = subprocess.run(
                ['git', 'status', '--porcelain'],
                cwd=self.repo_path,
                capture_output=True,
                text=True
            )
            if not result.stdout.strip():
                logger.info("no changes to commit")
                return

            # stage, commit, and push
            subprocess.run(['git', 'add', '.'], cwd=self.repo_path, check=True)
            msg = f"auto-commit: {time.strftime('%Y-%m-%d %H:%M:%S')}"
            subprocess.run(['git', 'commit', '-m', msg], cwd=self.repo_path, check=True)
            subprocess.run(['git', 'push', 'origin', 'main'], cwd=self.repo_path, check=True)
            
            logger.info("changes pushed successfully")

        except subprocess.CalledProcessError as e:
            logger.error(f"git command failed: {e}")
        except Exception as e:
            logger.error(f"unexpected error: {e}")

def main():
    # find the directory where the script is located
    repo_path = Path(__file__).parent.resolve()
    
    if not (repo_path / '.git').exists():
        logger.error("not a git repository")
        sys.exit(1)

    event_handler = AutoCommitHandler(repo_path)
    observer = Observer()
    observer.schedule(event_handler, str(repo_path), recursive=True)
    observer.start()

    logger.info(f"watching {repo_path} for changes...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        if event_handler.timer:
            event_handler.timer.cancel()
        logger.info("system stopped")
    observer.join()

if __name__ == "__main__":
    main()
