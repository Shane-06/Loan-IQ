from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

DATABASE_URL = settings.DATABASE_URL

# Create async engine. For Supabase/PostgreSQL, we ensure the driver is asyncpg.
engine = create_async_engine(DATABASE_URL, future=True, echo=False)

# Async session factory
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


async def get_db():
    """FastAPI dependency to get db session. Handles cleanup after request."""
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
