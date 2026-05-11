from pydantic_settings import baseSettings
from pydantic import field_validator
from typing import list, union
import logging

class settings(baseSettings):
    """application configuration settings."""

    # application
    app_name: str = "pkm"
    app_version: str = "1.0.0"
    debug: bool = false

    # server
    host: str = "0.0.0.0"
    port: int = 8000

    # database
    database_url: str = "sqlite:///./music.db"

    # music directory
    music_dir: str = "/path/to/music"

    # external apis
    acoustid_api_key: str = ""
    musicbrainz_user_agent: str = "pkm-music-app/1.0 (your-email@example.com)"
    
    # ollama configuration
    ollama_url: str = "http://127.0.0.1:11434"
    
    # passcode authentication (for mobile app offline access)
    passcode_user: str = ""
    passcode_hash: str = ""

    # cors - allow all for desktop apps (file:// protocol) and specific domain
    cors_origins: union[list[str], str] = [""]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.jwt_secret_key or self.jwt_secret_key == "changeme":
            import secrets
            import os
            # try to load or generate a persistent random key so tokens survive restarts
            key_file = os.path.join(os.path.dirname(__file__), '.jwt_secret')
            try:
                if os.path.exists(key_file):
                    with open(key_file, 'r') as f:
                        self.jwt_secret_key = f.read().strip()
                else:
                    self.jwt_secret_key = secrets.token_urlsafe(32)
                    with open(key_file, 'w') as f:
                        f.write(self.jwt_secret_key)
            except OSError:
                self.jwt_secret_key = secrets.token_urlsafe(32)
            logging.warning(
                "jwt_secret_key not set — using auto-generated persistent key. "
                "set jwt_secret_key in your .env file for production security."
            )
        
        # warn if passcode credentials are not set
        if not self.passcode_user or not self.passcode_hash:
            logging.warning(
                "passcode_user and passcode_hash are not set. passcode authentication is disabled."
            )

    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if v == "*" or v == "":
            return [""]
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v

    class config:
        env_file = ".env"
        case_sensitive = false

settings = settings()
