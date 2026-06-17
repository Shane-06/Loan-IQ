from datetime import timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.user import User
from app.schemas.user import UserCreate, Token
from app.utils.security import get_password_hash, verify_password, create_access_token


class AuthService:
    async def register_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        """Register a new user. Assigns admin role to the first registered user."""
        # Check if email is already taken
        result = await db.execute(select(User).where(User.email == user_in.email))
        existing_user = result.scalars().first()
        if existing_user:
            return None
            
        # Check if this is the first user in the system (default admin)
        count_result = await db.execute(select(func.count(User.id)))
        user_count = count_result.scalar() or 0
        role = "admin" if user_count == 0 else "user"

        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            role=role
        )
        
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    async def authenticate_user(self, db: AsyncSession, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def create_token_for_user(self, user: User) -> Token:
        """Generate JWT token containing user details and role."""
        access_token_expires = timedelta(minutes=60)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role},
            expires_delta=access_token_expires
        )
        return Token(
            access_token=access_token,
            token_type="bearer",
            role=user.role,
            email=user.email,
            full_name=user.full_name
        )


auth_service = AuthService()
