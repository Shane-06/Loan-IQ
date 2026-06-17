from app.routers.auth import router as auth_router
from app.routers.predict import router as predict_router
from app.routers.applications import router as applications_router
from app.routers.analytics import router as analytics_router
from app.routers.model_metrics import router as model_metrics_router

__all__ = [
    "auth_router",
    "predict_router",
    "applications_router",
    "analytics_router",
    "model_metrics_router"
]
