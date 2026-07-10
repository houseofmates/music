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
    music_dir: str = "/path/to/music"

    # External APIs
    acoustid_api_key: str = ""
    musicbrainz_user_agent: str = "pkm-music-app/1.0 (your-email@example.com)"

    # OLLAMA configuration
    ollama_url: str = "http://127.0.0.1:11434"

    # Passcode authentication (for mobile app offline access)
    passcode_user: str = ""
    passcode_hash: str = ""

    # CORS - allow all for desktop apps (file:// protocol) and specific domain
    cors_origins: Union[List[str], str] = ["*"]

    # Auth
    jwt_secret_key: str = ""
    jwt_exp_minutes: int = 60 * 24 * 7  # 1 week

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
