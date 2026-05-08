from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.orm import sessionmaker
from config import settings
import models_minimal  # noqa: F401  # ensures model metadata is registered

# Create database engine
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    echo=settings.debug
)

# Create session factory for direct use
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_db_and_tables():
    """Create database and all tables."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Dependency to get database session."""
    with Session(engine) as session:
        yield session
