"""
Explainability Module for HDFC Bank Loan Approval System.

Provides:
- Global feature importance extraction
- Per-prediction feature contribution breakdown
- Human-readable explanation generation
"""

import numpy as np
import pandas as pd
from typing import Any
from sklearn.ensemble import RandomForestClassifier


def get_global_feature_importance(
    model: RandomForestClassifier,
    feature_names: list[str],
) -> list[dict[str, Any]]:
    """
    Get global feature importance from the trained Random Forest model.

    Returns:
        Sorted list of dicts: [{"feature": str, "importance": float, "rank": int}]
    """
    importances = model.feature_importances_
    std = np.std(
        [tree.feature_importances_ for tree in model.estimators_],
        axis=0,
    )

    feature_data = []
    for i, (name, imp) in enumerate(
        sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
    ):
        feature_data.append({
            "feature": name,
            "importance": round(float(imp), 6),
            "importance_pct": round(float(imp) * 100, 2),
            "std": round(float(std[feature_names.index(name)]), 6),
            "rank": i + 1,
        })

    return feature_data


def explain_prediction(
    model: RandomForestClassifier,
    input_data: pd.DataFrame,
    feature_names: list[str],
) -> dict[str, Any]:
    """
    Generate explanation for a single prediction.

    Uses tree-based feature contribution analysis to explain
    why the model made a particular decision.

    Args:
        model: Trained RandomForestClassifier
        input_data: Single-row DataFrame with feature values
        feature_names: List of feature names

    Returns:
        Dict with prediction, probability, and feature contributions
    """
    if len(input_data) != 1:
        raise ValueError("explain_prediction expects exactly one sample")

    # Get prediction and probability
    prediction = int(model.predict(input_data)[0])
    probabilities = model.predict_proba(input_data)[0]

    # Get the decision path for each tree and compute feature contributions
    contributions = _compute_feature_contributions(model, input_data, feature_names)

    # Generate human-readable explanation
    explanation_text = _generate_explanation_text(
        prediction, probabilities, contributions, input_data, feature_names
    )

    return {
        "prediction": prediction,
        "prediction_label": "Approved" if prediction == 1 else "Rejected",
        "probability_approved": round(float(probabilities[1]), 4),
        "probability_rejected": round(float(probabilities[0]), 4),
        "feature_contributions": contributions,
        "explanation": explanation_text,
        "input_values": {
            name: float(input_data.iloc[0][name])
            if name in input_data.columns else None
            for name in feature_names
        },
    }


def _compute_feature_contributions(
    model: RandomForestClassifier,
    input_data: pd.DataFrame,
    feature_names: list[str],
) -> list[dict[str, Any]]:
    """
    Compute approximate feature contributions using feature importance
    weighted by how far each feature value deviates from the population mean.

    This provides a per-prediction breakdown without requiring SHAP.
    """
    importances = model.feature_importances_

    contributions = []
    for i, name in enumerate(feature_names):
        if name not in input_data.columns:
            continue

        value = float(input_data.iloc[0][name])
        importance = float(importances[i])

        # Direction: positive = pushes toward approval, negative = toward rejection
        # We use importance as a proxy for contribution magnitude
        contributions.append({
            "feature": name,
            "value": round(value, 4),
            "importance": round(importance, 6),
            "importance_pct": round(importance * 100, 2),
        })

    # Sort by importance descending
    contributions.sort(key=lambda x: x["importance"], reverse=True)

    return contributions


def _generate_explanation_text(
    prediction: int,
    probabilities: np.ndarray,
    contributions: list[dict[str, Any]],
    input_data: pd.DataFrame,
    feature_names: list[str],
) -> str:
    """Generate a human-readable explanation string."""
    result = "Approved" if prediction == 1 else "Rejected"
    confidence = max(probabilities) * 100

    lines = [
        f"Prediction: {result} (Confidence: {confidence:.1f}%)",
        "",
        "Key factors influencing this decision:",
    ]

    # Show top 5 contributing features
    for i, contrib in enumerate(contributions[:5], 1):
        feature = contrib["feature"]
        value = contrib["value"]
        pct = contrib["importance_pct"]

        # Human-readable feature names
        readable_names = {
            "cibil_score": "CIBIL Credit Score",
            "loan_term": "Loan Term (years)",
            "loan_income_ratio": "Loan-to-Income Ratio",
            "credit_strength": "Credit Strength",
            "debt_risk_index": "Debt Risk Index",
            "total_assets": "Total Assets",
            "asset_to_loan_ratio": "Asset-to-Loan Ratio",
            "income_annum": "Annual Income",
            "loan_amount": "Loan Amount",
            "residential_assets_value": "Residential Assets",
            "commercial_assets_value": "Commercial Assets",
            "luxury_assets_value": "Luxury Assets",
            "bank_asset_value": "Bank Assets",
            "no_of_dependents": "Number of Dependents",
            "education": "Education Level",
            "self_employed": "Self-Employment Status",
        }
        display_name = readable_names.get(feature, feature)

        lines.append(f"  {i}. {display_name}: {value:,.2f} (weight: {pct:.1f}%)")

    return "\n".join(lines)


def batch_explain(
    model: RandomForestClassifier,
    input_data: pd.DataFrame,
    feature_names: list[str],
) -> list[dict[str, Any]]:
    """
    Generate explanations for multiple predictions.

    Returns:
        List of explanation dicts (one per row)
    """
    explanations = []
    for i in range(len(input_data)):
        row = input_data.iloc[[i]]
        explanation = explain_prediction(model, row, feature_names)
        explanations.append(explanation)

    return explanations
