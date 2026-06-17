"""
Feature Engineering Module for HDFC Bank Loan Approval System.

Creates derived features and encodes categorical variables:
- loan_income_ratio
- total_assets
- asset_to_loan_ratio
- credit_strength (normalized CIBIL)
- debt_risk_index
- Categorical encoding
- Correlation analysis
"""

import pandas as pd
import numpy as np
from typing import Any


def encode_categoricals(df: pd.DataFrame) -> pd.DataFrame:
    """Encode categorical columns to numeric values."""
    df = df.copy()

    if "education" in df.columns:
        df["education"] = df["education"].map(
            {"graduate": 1, "not graduate": 0}
        )
        df["education"] = pd.to_numeric(df["education"], errors="coerce").fillna(0).astype(int)

    if "self_employed" in df.columns:
        df["self_employed"] = df["self_employed"].map(
            {"yes": 1, "no": 0}
        )
        df["self_employed"] = pd.to_numeric(df["self_employed"], errors="coerce").fillna(0).astype(int)

    if "loan_status" in df.columns:
        df["loan_status"] = df["loan_status"].map(
            {"approved": 1, "rejected": 0}
        )
        df["loan_status"] = pd.to_numeric(df["loan_status"], errors="coerce").fillna(0).astype(int)

    return df


def create_loan_income_ratio(df: pd.DataFrame) -> pd.DataFrame:
    """Create loan-to-income ratio feature."""
    df = df.copy()
    df["loan_income_ratio"] = np.where(
        df["income_annum"] > 0,
        df["loan_amount"] / df["income_annum"],
        0.0,
    )
    return df


def create_total_assets(df: pd.DataFrame) -> pd.DataFrame:
    """Create total assets feature (sum of all asset types)."""
    df = df.copy()
    asset_cols = [
        "residential_assets_value",
        "commercial_assets_value",
        "luxury_assets_value",
        "bank_asset_value",
    ]
    existing = [c for c in asset_cols if c in df.columns]
    df["total_assets"] = df[existing].sum(axis=1)
    return df


def create_asset_to_loan_ratio(df: pd.DataFrame) -> pd.DataFrame:
    """Create asset-to-loan ratio feature."""
    df = df.copy()
    if "total_assets" not in df.columns:
        df = create_total_assets(df)

    df["asset_to_loan_ratio"] = np.where(
        df["loan_amount"] > 0,
        df["total_assets"] / df["loan_amount"],
        0.0,
    )
    return df


def create_credit_strength(df: pd.DataFrame) -> pd.DataFrame:
    """Create normalized credit strength feature (CIBIL / 900)."""
    df = df.copy()
    if "cibil_score" in df.columns:
        df["credit_strength"] = df["cibil_score"] / 900.0
    return df


def create_debt_risk_index(df: pd.DataFrame) -> pd.DataFrame:
    """Create debt risk index: loan_amount / (income_annum + total_assets)."""
    df = df.copy()
    if "total_assets" not in df.columns:
        df = create_total_assets(df)

    denominator = df["income_annum"] + df["total_assets"]
    df["debt_risk_index"] = np.where(
        denominator > 0,
        df["loan_amount"] / denominator,
        0.0,
    )
    return df


def compute_correlation_analysis(df: pd.DataFrame) -> dict[str, Any]:
    """
    Compute correlation matrix for numeric features.

    Returns:
        Dict with 'correlation_matrix' (as nested dict) and
        'high_correlations' (pairs with |r| > 0.7)
    """
    numeric_df = df.select_dtypes(include=[np.number])
    corr_matrix = numeric_df.corr()

    high_correlations: list[dict[str, Any]] = []
    cols = corr_matrix.columns.tolist()
    for i, col1 in enumerate(cols):
        for col2 in cols[i + 1:]:
            r = corr_matrix.loc[col1, col2]
            if abs(r) > 0.7:
                high_correlations.append({
                    "feature_1": col1,
                    "feature_2": col2,
                    "correlation": round(float(r), 4),
                })

    return {
        "correlation_matrix": corr_matrix.round(4).to_dict(),
        "high_correlations": high_correlations,
    }


def create_debt_to_income_ratio(df: pd.DataFrame) -> pd.DataFrame:
    """Create Debt-to-Income (DTI) ratio feature."""
    df = df.copy()
    monthly_debt = df["monthly_emi"] + np.where(
        df["loan_term"] > 0,
        df["loan_amount"] / (df["loan_term"] * 12.0),
        0.0
    )
    monthly_income = np.where(
        df["income_annum"] > 0,
        df["income_annum"] / 12.0,
        1.0
    )
    df["debt_to_income_ratio"] = monthly_debt / monthly_income
    return df


def engineer_features(
    df: pd.DataFrame,
    drop_loan_id: bool = True,
) -> tuple[pd.DataFrame, dict[str, Any]]:
    """
    Run the full feature engineering pipeline.

    Args:
        df: Cleaned DataFrame
        drop_loan_id: Whether to drop the loan_id column

    Returns:
        Tuple of (engineered DataFrame, feature engineering report)
    """
    report: dict[str, Any] = {
        "original_columns": df.columns.tolist(),
        "features_created": [],
    }

    # Encode categoricals
    df = encode_categoricals(df)
    report["features_created"].append("education (encoded)")
    report["features_created"].append("self_employed (encoded)")
    report["features_created"].append("loan_status (encoded)")

    # Create derived features
    df = create_loan_income_ratio(df)
    report["features_created"].append("loan_income_ratio")

    df = create_total_assets(df)
    report["features_created"].append("total_assets")

    df = create_asset_to_loan_ratio(df)
    report["features_created"].append("asset_to_loan_ratio")

    df = create_credit_strength(df)
    report["features_created"].append("credit_strength")

    df = create_debt_risk_index(df)
    report["features_created"].append("debt_risk_index")

    df = create_debt_to_income_ratio(df)
    report["features_created"].append("debt_to_income_ratio")

    # Drop loan_id
    if drop_loan_id and "loan_id" in df.columns:
        df = df.drop("loan_id", axis=1)
        report["dropped_columns"] = ["loan_id"]

    # Correlation analysis
    corr_analysis = compute_correlation_analysis(df)
    report["correlation_analysis"] = corr_analysis

    report["final_columns"] = df.columns.tolist()
    report["final_shape"] = df.shape

    return df, report
