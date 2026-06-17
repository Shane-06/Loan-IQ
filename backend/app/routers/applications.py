from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from app.database import get_db
from app.models.user import User
from app.models.application import LoanApplication
from app.middleware.auth import get_current_user, get_admin_user
from app.schemas.application import ApplicationResponse

router = APIRouter(prefix="/applications", tags=["Loan Applications"])


@router.get("", response_model=list[ApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve application history for the currently authenticated user."""
    query = select(LoanApplication).where(LoanApplication.user_id == current_user.id).order_by(desc(LoanApplication.created_at))
    result = await db.execute(query)
    apps = result.scalars().all()
    return apps


@router.get("/all", response_model=list[ApplicationResponse])
async def get_all_applications(
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all system-wide applications (Administrators only)."""
    query = select(LoanApplication).order_by(desc(LoanApplication.created_at))
    result = await db.execute(query)
    apps = result.scalars().all()
    return apps


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application_details(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a single application record by ID if owned or if user is an Admin."""
    result = await db.execute(select(LoanApplication).where(LoanApplication.id == app_id))
    app = result.scalars().first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found"
        )
        
    # Check permissions (must be owner or admin)
    if app.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this application"
        )
        
    return app
