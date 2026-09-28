"""
Database connection layer.
Set USE_MOCK_DATA=false in .env once the real PostgreSQL DB is loaded (see db/schema.sql + db/load_data.py).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db_connection():
    """Yields a raw SQLAlchemy connection for executing hand-written SQL."""
    conn = engine.connect()
    try:
        yield conn
    finally:
        conn.close()