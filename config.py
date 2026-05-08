from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import logging


class Settings(BaseSettings):
    """Application configuration settings."""

    # Application
    app_name: str = "pkm"
    app_version: str = "1.0.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "sqlite:///./music.db"

    # Music Directory
    music_dir: str = "/mnt/nextcloud/house/files/media/music"

    # External APIs
    acoustid_api_key: str = ""
    musicbrainz_user_agent: str = "pkm-music-app/1.0 (your-email@example.com)"
    # CORS - allow all for desktop apps (file:// protocol) and specific domain
    cors_origins: Union[List[str], str] = ["*"]

    # Auth
    jwt_secret_key: str = ""
    jwt_exp_minutes: int = 60 * 24 * 7  # 1 week

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.jwt_secret_key or self.jwt_secret_key == "changeme":
            import secrets
            import os
            # Try to load or generate a persistent random key so tokens survive restarts
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
                "JWT_SECRET_KEY not set — using auto-generated persistent key. "
                "Set JWT_SECRET_KEY in your .env file for production security."
            )
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if v == "*" or v == "":
            return ["*"]
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
