from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.middleware.auth import get_current_user
from app.schemas.application import AnalyticsResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
async def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve analytics summary data.
    If the user is an administrator, returns system-wide metrics.
    Otherwise, returns metrics scoped to the current user's history.
    """
    # If admin, fetch global system analytics
    if current_user.role == "admin":
        return await analytics_service.get_analytics(db, user_id=None)
    
    # If regular user, fetch user-specific analytics
    return await analytics_service.get_analytics(db, user_id=current_user.id)
