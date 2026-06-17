"""
Model Monitoring Module for HDFC Bank Loan Approval System.

Monitors:
- Overfitting: train_accuracy - val_accuracy > 5%
- Underfitting: both train and val accuracy below threshold
- Feature dominance: single feature > 70% importance
- Feature ablation tests
- Learning curve data generation
"""

import numpy as np
import pandas as pd
from typing import Any

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import learning_curve, StratifiedKFold


def detect_overfitting(
    train_accuracy: float,
    val_accuracy: float,
    threshold: float = 0.05,
) -> dict[str, Any]:
    """
    Detect overfitting when train accuracy exceeds validation by > threshold.

    Returns:
        Dict with detection result and details
    """
    gap = train_accuracy - val_accuracy
    is_overfitting = gap > threshold

    severity = "none"
    if gap > 0.10:
        severity = "severe"
    elif gap > threshold:
        severity = "moderate"

    return {
        "is_overfitting": is_overfitting,
        "train_accuracy": round(train_accuracy, 6),
        "validation_accuracy": round(val_accuracy, 6),
        "gap": round(gap, 6),
        "threshold": threshold,
        "severity": severity,
        "recommendation": (
            "Model is overfitting. Consider: increasing regularization "
            "(max_depth, min_samples_leaf), reducing model complexity, "
            "adding more training data, or using dropout/pruning techniques."
            if is_overfitting
            else "No overfitting detected."
        ),
    }


def detect_underfitting(
    train_accuracy: float,
    val_accuracy: float,
    min_threshold: float = 0.85,
) -> dict[str, Any]:
    """
    Detect underfitting when both train and val accuracy are below threshold.

    Returns:
        Dict with detection result and details
    """
    is_underfitting = train_accuracy < min_threshold and val_accuracy < min_threshold

    return {
        "is_underfitting": is_underfitting,
        "train_accuracy": round(train_accuracy, 6),
        "validation_accuracy": round(val_accuracy, 6),
        "min_threshold": min_threshold,
        "recommendation": (
            "Model is underfitting. Consider: adding more features, "
            "increasing model complexity (more estimators, deeper trees), "
            "reducing regularization, or trying feature engineering."
            if is_underfitting
            else "No underfitting detected."
        ),
    }


def analyze_feature_dominance(
    model: RandomForestClassifier,
    feature_names: list[str],
    dominance_threshold: float = 0.70,
) -> dict[str, Any]:
    """
    Detect if any single feature dominates predictions (> threshold importance).

    Returns:
        Dict with dominance analysis results
    """
    importances = model.feature_importances_
    feature_importance = sorted(
        zip(feature_names, importances),
        key=lambda x: x[1],
        reverse=True,
    )

    # Check for dominant feature
    top_feature_name, top_feature_importance = feature_importance[0]
    is_dominant = top_feature_importance > dominance_threshold

    # Top 3 features
    top_features = [
        {"feature": name, "importance": round(float(imp), 6)}
        for name, imp in feature_importance[:3]
    ]

    # All features
    all_features = [
        {"feature": name, "importance": round(float(imp), 6)}
        for name, imp in feature_importance
    ]

    return {
        "is_dominant": is_dominant,
        "dominant_feature": top_feature_name if is_dominant else None,
        "dominant_importance": round(float(top_feature_importance), 6),
        "dominance_threshold": dominance_threshold,
        "top_features": top_features,
        "all_features": all_features,
        "warning": (
            f"WARNING: Feature '{top_feature_name}' contributes "
            f"{top_feature_importance:.1%} of total importance, exceeding "
            f"the {dominance_threshold:.0%} threshold. The model may be "
            f"over-reliant on this single feature. Consider feature ablation "
            f"testing and diversifying the feature set."
            if is_dominant
            else "No feature dominance detected."
        ),
    }


def run_feature_ablation(
    model: RandomForestClassifier,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    feature_names: list[str],
    top_n: int = 5,
) -> list[dict[str, Any]]:
    """
    Run feature ablation test: measure accuracy drop when each top feature is removed.

    Returns:
        List of dicts with feature name, original accuracy, ablated accuracy, and drop
    """
    from sklearn.metrics import accuracy_score

    original_accuracy = accuracy_score(y_test, model.predict(X_test))

    # Get top-N features by importance
    importances = model.feature_importances_
    feature_imp = sorted(
        zip(feature_names, importances, range(len(feature_names))),
        key=lambda x: x[1],
        reverse=True,
    )

    ablation_results = []

    for name, imp, idx in feature_imp[:top_n]:
        # Ablate by replacing column with its mean
        X_ablated = X_test.copy()
        X_ablated.iloc[:, idx] = X_ablated.iloc[:, idx].mean()

        ablated_accuracy = accuracy_score(y_test, model.predict(X_ablated))
        drop = original_accuracy - ablated_accuracy

        ablation_results.append({
            "feature": name,
            "importance": round(float(imp), 6),
            "original_accuracy": round(float(original_accuracy), 6),
            "ablated_accuracy": round(float(ablated_accuracy), 6),
            "accuracy_drop": round(float(drop), 6),
        })

    return ablation_results


def generate_learning_curve_data(
    model: RandomForestClassifier,
    X: pd.DataFrame,
    y: pd.Series,
    cv_folds: int = 5,
    n_points: int = 10,
    random_state: int = 42,
) -> dict[str, Any]:
    """
    Generate learning curve data for frontend visualization.

    Returns:
        Dict with train_sizes, train_scores, validation_scores
    """
    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=random_state)

    train_sizes, train_scores, val_scores = learning_curve(
        model, X, y,
        cv=cv,
        n_jobs=-1,
        train_sizes=np.linspace(0.1, 1.0, n_points),
        scoring="accuracy",
    )

    return {
        "train_sizes": train_sizes.tolist(),
        "train_scores_mean": train_scores.mean(axis=1).round(6).tolist(),
        "train_scores_std": train_scores.std(axis=1).round(6).tolist(),
        "val_scores_mean": val_scores.mean(axis=1).round(6).tolist(),
        "val_scores_std": val_scores.std(axis=1).round(6).tolist(),
    }


def run_full_monitoring(
    model: RandomForestClassifier,
    evaluation_metrics: dict[str, Any],
    feature_names: list[str],
    X_test: pd.DataFrame,
    y_test: pd.Series,
    X_full: pd.DataFrame | None = None,
    y_full: pd.Series | None = None,
) -> dict[str, Any]:
    """
    Run all monitoring checks and return comprehensive health report.

    Args:
        model: Trained model
        evaluation_metrics: Output from model_evaluation.evaluate_model()
        feature_names: Feature names list
        X_test, y_test: Test data for ablation
        X_full, y_full: Full training data for learning curves (optional)

    Returns:
        Comprehensive monitoring report dict
    """
    train_acc = evaluation_metrics["train"]["accuracy"]
    val_acc = evaluation_metrics["validation"]["accuracy"]

    report: dict[str, Any] = {
        "overfitting": detect_overfitting(train_acc, val_acc),
        "underfitting": detect_underfitting(train_acc, val_acc),
        "feature_dominance": analyze_feature_dominance(model, feature_names),
        "feature_ablation": run_feature_ablation(
            model, X_test, y_test, feature_names
        ),
    }

    # Learning curves (optional, can be slow)
    if X_full is not None and y_full is not None:
        report["learning_curve"] = generate_learning_curve_data(
            model, X_full, y_full
        )

    # Overall health status
    issues = []
    if report["overfitting"]["is_overfitting"]:
        issues.append(f"Overfitting ({report['overfitting']['severity']})")
    if report["underfitting"]["is_underfitting"]:
        issues.append("Underfitting")
    if report["feature_dominance"]["is_dominant"]:
        issues.append(
            f"Feature dominance: {report['feature_dominance']['dominant_feature']}"
        )

    report["overall_status"] = "healthy" if not issues else "warning"
    report["issues"] = issues

    return report


def print_monitoring_summary(report: dict[str, Any]) -> None:
    """Print monitoring report summary to console."""
    print("\n" + "=" * 60)
    print("MODEL HEALTH MONITORING REPORT")
    print("=" * 60)

    # Overall status
    status = report["overall_status"].upper()
    print(f"\nOverall Status: {'[OK]' if status == 'HEALTHY' else '[WARN]'} {status}")
    if report["issues"]:
        for issue in report["issues"]:
            print(f"  [!] {issue}")

    # Overfitting
    ovf = report["overfitting"]
    print(f"\n--- Overfitting Check ---")
    print(f"  Train Acc: {ovf['train_accuracy']:.4f}")
    print(f"  Val Acc:   {ovf['validation_accuracy']:.4f}")
    print(f"  Gap:       {ovf['gap']:.4f} (threshold: {ovf['threshold']:.2f})")
    print(f"  Status:    {'[WARN] ' + ovf['severity'] if ovf['is_overfitting'] else '[OK]'}")

    # Underfitting
    udf = report["underfitting"]
    print(f"\n--- Underfitting Check ---")
    print(f"  Status: {'[WARN] Underfitting' if udf['is_underfitting'] else '[OK]'}")

    # Feature dominance
    fd = report["feature_dominance"]
    print(f"\n--- Feature Dominance ---")
    print(f"  Top Feature: {fd['top_features'][0]['feature']} "
          f"({fd['top_features'][0]['importance']:.1%})")
    print(f"  Status: {'[WARN] DOMINANT' if fd['is_dominant'] else '[OK]'}")
    if fd["is_dominant"]:
        print(f"  {fd['warning']}")

    # Ablation
    print(f"\n--- Feature Ablation (Top 5) ---")
    for ab in report["feature_ablation"]:
        print(f"  {ab['feature']:30s} -> drop: {ab['accuracy_drop']:.4f}")

    print("\n" + "=" * 60)
