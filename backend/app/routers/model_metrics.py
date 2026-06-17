from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import get_admin_user
from app.models.user import User
from app.schemas.model_metrics import (
    ModelMetricsResponse,
    ModelHealthResponse,
    FeatureImportanceItem,
    ModelEvaluationMetrics,
    TrainingReport
)
from app.services.ml_service import ml_service

router = APIRouter(prefix="/model-metrics", tags=["Model Metrics"])


@router.get("", response_model=ModelMetricsResponse)
async def get_model_metrics(admin_user: User = Depends(get_admin_user)):
    """Retrieve full hyperparameter configuration and evaluation metrics for the active model."""
    report = ml_service.load_latest_report()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Latest training report not found on disk"
        )
        
    training_data = report.get("training", {})
    eval_data = report.get("evaluation", {})
    test_metrics = eval_data.get("test", {})
    cv_metrics = eval_data.get("cross_validation", {})
    cm_metrics = eval_data.get("confusion_matrix", {})
    
    # Map to schema
    training_report = TrainingReport(
        best_params=training_data.get("best_params", {}),
        cv_folds=training_data.get("cv_folds", 5),
        cv_mean_accuracy=training_data.get("cv_mean_accuracy", 0.0),
        cv_std_accuracy=training_data.get("cv_std_accuracy", 0.0),
        cv_train_mean_accuracy=training_data.get("cv_train_mean_accuracy", 0.0),
        total_candidates_evaluated=training_data.get("total_candidates_evaluated", 0)
    )
    
    evaluation_metrics = ModelEvaluationMetrics(
        accuracy=test_metrics.get("accuracy", 0.0),
        precision=test_metrics.get("precision", 0.0),
        recall=test_metrics.get("recall", 0.0),
        f1_score=test_metrics.get("f1_score", 0.0),
        roc_auc=test_metrics.get("roc_auc", 0.0),
        confusion_matrix=cm_metrics.get("matrix", [[0, 0], [0, 0]]),
        cv_mean=cv_metrics.get("cv_mean", 0.0),
        cv_std=cv_metrics.get("cv_std", 0.0)
    )
    
    return ModelMetricsResponse(
        model_type=ml_service.model_type or "RandomForestClassifier",
        timestamp=ml_service.timestamp or "unknown",
        feature_names=ml_service.feature_names or [],
        training_report=training_report,
        evaluation_metrics=evaluation_metrics
    )


@router.get("/health", response_model=ModelHealthResponse)
async def get_model_health(admin_user: User = Depends(get_admin_user)):
    """Retrieve model monitoring warnings (overfitting, underfitting, feature dominance)."""
    health = ml_service.get_health_report()
    
    return ModelHealthResponse(
        status=health.get("status", "HEALTHY"),
        overfitting=health.get("overfitting", False),
        underfitting=health.get("underfitting", False),
        feature_dominance=health.get("feature_dominance", False),
        issues=health.get("issues", []),
        metrics=health.get("metrics", {})
    )


@router.get("/feature-importance", response_model=list[FeatureImportanceItem])
async def get_feature_importance(admin_user: User = Depends(get_admin_user)):
    """Retrieve the sorted global feature importances for active model."""
    importances = ml_service.get_feature_importance()
    
    return [
        FeatureImportanceItem(
            feature=fi["feature"],
            importance=fi["importance"],
            importance_pct=fi["importance_pct"]
        )
        for fi in importances
    ]
