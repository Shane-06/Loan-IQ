"""
Model Evaluation Module for HDFC Bank Loan Approval System.

Computes:
- Accuracy, Precision, Recall, F1 Score
- ROC-AUC
- Confusion Matrix
- Cross-validation mean and variance
- Classification report
- Returns structured metrics dict for API consumption
"""

import numpy as np
import pandas as pd
from typing import Any

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier


def evaluate_model(
    model: RandomForestClassifier,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    cv_folds: int = 5,
    random_state: int = 42,
) -> dict[str, Any]:
    """
    Comprehensive model evaluation on train, validation, and test sets.

    Returns:
        Dict with all evaluation metrics
    """
    # --- Predictions ---
    y_train_pred = model.predict(X_train)
    y_val_pred = model.predict(X_val)
    y_test_pred = model.predict(X_test)

    # Probabilities for ROC-AUC
    y_train_proba = model.predict_proba(X_train)[:, 1]
    y_val_proba = model.predict_proba(X_val)[:, 1]
    y_test_proba = model.predict_proba(X_test)[:, 1]

    # --- Train Metrics ---
    train_metrics = _compute_metrics(y_train, y_train_pred, y_train_proba, "train")

    # --- Validation Metrics ---
    val_metrics = _compute_metrics(y_val, y_val_pred, y_val_proba, "validation")

    # --- Test Metrics ---
    test_metrics = _compute_metrics(y_test, y_test_pred, y_test_proba, "test")

    # --- Cross-Validation ---
    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=random_state)
    X_full = pd.concat([X_train, X_val], axis=0)
    y_full = pd.concat([y_train, y_val], axis=0)
    cv_scores = cross_val_score(model, X_full, y_full, cv=cv, scoring="accuracy")

    cv_metrics = {
        "cv_folds": cv_folds,
        "cv_scores": cv_scores.round(6).tolist(),
        "cv_mean": round(float(cv_scores.mean()), 6),
        "cv_std": round(float(cv_scores.std()), 6),
        "cv_variance": round(float(cv_scores.var()), 8),
    }

    # --- Confusion Matrix (test set) ---
    cm = confusion_matrix(y_test, y_test_pred)
    cm_data = {
        "matrix": cm.tolist(),
        "true_negatives": int(cm[0][0]),
        "false_positives": int(cm[0][1]),
        "false_negatives": int(cm[1][0]),
        "true_positives": int(cm[1][1]),
    }

    # --- ROC Curve Data (test set) ---
    fpr, tpr, thresholds = roc_curve(y_test, y_test_proba)
    roc_data = {
        "fpr": fpr.round(4).tolist(),
        "tpr": tpr.round(4).tolist(),
        "thresholds": thresholds.round(4).tolist(),
    }

    # --- Classification Report (test set) ---
    cls_report = classification_report(y_test, y_test_pred, output_dict=True)

    return {
        "train": train_metrics,
        "validation": val_metrics,
        "test": test_metrics,
        "cross_validation": cv_metrics,
        "confusion_matrix": cm_data,
        "roc_curve": roc_data,
        "classification_report": cls_report,
    }


def _compute_metrics(
    y_true: pd.Series,
    y_pred: np.ndarray,
    y_proba: np.ndarray,
    split_name: str,
) -> dict[str, Any]:
    """Compute standard classification metrics for a given split."""
    return {
        "split": split_name,
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 6),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 6),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 6),
        "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 6),
        "roc_auc": round(float(roc_auc_score(y_true, y_proba)), 6),
        "sample_count": int(len(y_true)),
    }


def print_evaluation_summary(metrics: dict[str, Any]) -> None:
    """Print a human-readable summary of evaluation metrics."""
    print("\n" + "=" * 60)
    print("MODEL EVALUATION SUMMARY")
    print("=" * 60)

    for split in ["train", "validation", "test"]:
        m = metrics[split]
        print(f"\n--- {m['split'].upper()} SET ({m['sample_count']} samples) ---")
        print(f"  Accuracy:  {m['accuracy']:.4f}")
        print(f"  Precision: {m['precision']:.4f}")
        print(f"  Recall:    {m['recall']:.4f}")
        print(f"  F1 Score:  {m['f1_score']:.4f}")
        print(f"  ROC-AUC:   {m['roc_auc']:.4f}")

    cv = metrics["cross_validation"]
    print(f"\n--- CROSS-VALIDATION ({cv['cv_folds']}-fold) ---")
    print(f"  Mean Accuracy: {cv['cv_mean']:.4f}")
    print(f"  Std:           {cv['cv_std']:.4f}")
    print(f"  Variance:      {cv['cv_variance']:.6f}")
    print(f"  Scores:        {cv['cv_scores']}")

    cm = metrics["confusion_matrix"]
    print(f"\n--- CONFUSION MATRIX (Test Set) ---")
    print(f"  True Negatives:  {cm['true_negatives']}")
    print(f"  False Positives: {cm['false_positives']}")
    print(f"  False Negatives: {cm['false_negatives']}")
    print(f"  True Positives:  {cm['true_positives']}")

    print("\n" + "=" * 60)
