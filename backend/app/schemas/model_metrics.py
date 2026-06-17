from typing import Any, Dict, List
from pydantic import BaseModel


class TrainingReport(BaseModel):
    best_params: Dict[str, Any]
    cv_folds: int
    cv_mean_accuracy: float
    cv_std_accuracy: float
    cv_train_mean_accuracy: float
    total_candidates_evaluated: int


class ModelEvaluationMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: List[List[int]]
    cv_mean: float
    cv_std: float


class ModelMetricsResponse(BaseModel):
    model_type: str
    timestamp: str
    feature_names: List[str]
    training_report: TrainingReport
    evaluation_metrics: ModelEvaluationMetrics


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    importance_pct: float


class ModelHealthResponse(BaseModel):
    status: str  # "HEALTHY" or "WARNING"
    overfitting: bool
    underfitting: bool
    feature_dominance: bool
    issues: List[str]
    metrics: Dict[str, Any]
