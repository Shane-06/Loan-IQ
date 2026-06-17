from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers.auth import router as auth_router
from app.routers.predict import router as predict_router
from app.routers.applications import router as applications_router
from app.routers.analytics import router as analytics_router
from app.routers.model_metrics import router as model_metrics_router
from app.services.ml_service import ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML model and create database tables
    print("Starting up FastAPI application...")
    try:
        # Load ML model
        ml_service.load_model()
    except Exception as e:
        print(f"Warning: Could not pre-load model on startup: {str(e)}")
        
    try:
        # Create database tables (SQLite fallback / Postgres connection test)
        from app.database import Base, engine
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database tables initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not initialize database tables: {str(e)}")
        
    yield
    # Shutdown: Clean up resources if necessary
    print("Shutting down FastAPI application...")


app = FastAPI(
    title="Loan-IQ AI-Powered Underwriting Engine",
    description="FastAPI Backend for Loan-IQ Credit Prediction and Analytics",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = settings.CORS_ORIGINS
if isinstance(origins, str):
    origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Router Endpoints
app.include_router(auth_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(applications_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(model_metrics_router, prefix="/api")


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": ml_service.model is not None,
        "model_version": ml_service.timestamp or "none",
        "model_type": ml_service.model_type or "none"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
