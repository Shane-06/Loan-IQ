"""
Data Cleaning Module for HDFC Bank Loan Approval System.

Handles:
- Column whitespace stripping
- Datatype validation and casting
- Duplicate detection and removal
- Outlier detection (IQR and Z-score)
- CIBIL score range validation (300-900)
- Missing value handling
- Cleaning report generation
"""

import pandas as pd
import numpy as np
from typing import Any


def strip_whitespace(df: pd.DataFrame) -> pd.DataFrame:
    """Strip whitespace from column names and string column values."""
    df = df.copy()
    df.columns = df.columns.str.strip()

    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str).str.strip()

    return df


def validate_datatypes(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    """
    Validate and cast datatypes for known columns.

    Returns:
        Tuple of (cleaned DataFrame, list of warning messages)
    """
    df = df.copy()
    warnings: list[str] = []

    numeric_columns = [
        "loan_id", "no_of_dependents", "income_annum", "loan_amount",
        "loan_term", "cibil_score", "residential_assets_value",
        "commercial_assets_value", "luxury_assets_value", "bank_asset_value",
        "previous_defaults", "credit_utilization_ratio", "monthly_emi",
    ]
    categorical_columns = ["education", "self_employed", "loan_status"]

    for col in numeric_columns:
        if col in df.columns:
            original_dtype = df[col].dtype
            df[col] = pd.to_numeric(df[col], errors="coerce")
            coerced_nulls = df[col].isna().sum()
            if coerced_nulls > 0:
                warnings.append(
                    f"Column '{col}': {coerced_nulls} values coerced to NaN "
                    f"during numeric conversion (original dtype: {original_dtype})"
                )

    for col in categorical_columns:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.lower()

    return df, warnings


def remove_duplicates(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """
    Remove duplicate rows.

    Returns:
        Tuple of (deduplicated DataFrame, count of removed duplicates)
    """
    original_count = len(df)
    df = df.drop_duplicates()
    removed = original_count - len(df)
    return df, removed


def detect_outliers_iqr(
    df: pd.DataFrame,
    columns: list[str] | None = None,
    factor: float = 1.5,
) -> dict[str, dict[str, Any]]:
    """
    Detect outliers using IQR method.

    Returns:
        Dict mapping column names to outlier info
        {col: {"count": int, "lower_bound": float, "upper_bound": float, "indices": list}}
    """
    if columns is None:
        columns = df.select_dtypes(include=[np.number]).columns.tolist()

    outlier_report: dict[str, dict[str, Any]] = {}

    for col in columns:
        if col not in df.columns:
            continue
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - factor * iqr
        upper = q3 + factor * iqr

        mask = (df[col] < lower) | (df[col] > upper)
        outlier_count = mask.sum()

        if outlier_count > 0:
            outlier_report[col] = {
                "count": int(outlier_count),
                "lower_bound": float(lower),
                "upper_bound": float(upper),
                "indices": df[mask].index.tolist(),
            }

    return outlier_report


def detect_outliers_zscore(
    df: pd.DataFrame,
    columns: list[str] | None = None,
    threshold: float = 3.0,
) -> dict[str, dict[str, Any]]:
    """
    Detect outliers using Z-score method.

    Returns:
        Dict mapping column names to outlier info
    """
    if columns is None:
        columns = df.select_dtypes(include=[np.number]).columns.tolist()

    outlier_report: dict[str, dict[str, Any]] = {}

    for col in columns:
        if col not in df.columns:
            continue
        mean = df[col].mean()
        std = df[col].std()
        if std == 0:
            continue

        z_scores = ((df[col] - mean) / std).abs()
        mask = z_scores > threshold
        outlier_count = mask.sum()

        if outlier_count > 0:
            outlier_report[col] = {
                "count": int(outlier_count),
                "threshold": threshold,
                "indices": df[mask].index.tolist(),
            }

    return outlier_report


def validate_cibil_score(
    df: pd.DataFrame, col: str = "cibil_score"
) -> tuple[pd.DataFrame, int]:
    """
    Validate CIBIL score is within 300-900 range.
    Clips values outside range and reports count of clipped values.

    Returns:
        Tuple of (DataFrame with clipped values, count of clipped rows)
    """
    df = df.copy()
    if col not in df.columns:
        return df, 0

    out_of_range = ((df[col] < 300) | (df[col] > 900)).sum()
    df[col] = df[col].clip(lower=300, upper=900)

    return df, int(out_of_range)


def handle_missing_values(
    df: pd.DataFrame,
    numeric_strategy: str = "median",
    categorical_strategy: str = "mode",
) -> tuple[pd.DataFrame, dict[str, int]]:
    """
    Handle missing values with configurable strategies.

    Args:
        numeric_strategy: "median", "mean", or "drop"
        categorical_strategy: "mode" or "drop"

    Returns:
        Tuple of (filled DataFrame, dict of {col: missing_count})
    """
    df = df.copy()
    missing_report: dict[str, int] = {}

    for col in df.columns:
        missing_count = df[col].isna().sum()
        if missing_count == 0:
            continue

        missing_report[col] = int(missing_count)

        if df[col].dtype in [np.float64, np.int64, float, int]:
            if numeric_strategy == "median":
                df[col] = df[col].fillna(df[col].median())
            elif numeric_strategy == "mean":
                df[col] = df[col].fillna(df[col].mean())
            elif numeric_strategy == "drop":
                df = df.dropna(subset=[col])
        else:
            if categorical_strategy == "mode":
                mode_val = df[col].mode()
                if len(mode_val) > 0:
                    df[col] = df[col].fillna(mode_val[0])
            elif categorical_strategy == "drop":
                df = df.dropna(subset=[col])

    return df, missing_report


def clean_data(df: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, Any]]:
    """
    Run the full data cleaning pipeline.

    Returns:
        Tuple of (cleaned DataFrame, comprehensive cleaning report)
    """
    report: dict[str, Any] = {
        "original_shape": df.shape,
        "steps": [],
    }

    # Step 1: Strip whitespace
    df = strip_whitespace(df)
    report["steps"].append({"step": "strip_whitespace", "status": "completed"})

    # Step 2: Validate datatypes
    df, dtype_warnings = validate_datatypes(df)
    report["steps"].append({
        "step": "validate_datatypes",
        "warnings": dtype_warnings,
    })

    # Step 3: Remove duplicates
    df, dup_count = remove_duplicates(df)
    report["steps"].append({
        "step": "remove_duplicates",
        "duplicates_removed": dup_count,
    })

    # Step 4: Validate CIBIL score
    df, cibil_clipped = validate_cibil_score(df)
    report["steps"].append({
        "step": "validate_cibil_score",
        "values_clipped": cibil_clipped,
    })

    # Step 5: Handle missing values
    df, missing_info = handle_missing_values(df)
    report["steps"].append({
        "step": "handle_missing_values",
        "columns_with_missing": missing_info,
    })

    # Step 6: Detect outliers (report only, no removal)
    analysis_cols = [
        "income_annum", "loan_amount", "cibil_score",
        "residential_assets_value", "commercial_assets_value",
        "luxury_assets_value", "bank_asset_value",
        "previous_defaults", "credit_utilization_ratio", "monthly_emi",
    ]
    iqr_outliers = detect_outliers_iqr(df, columns=analysis_cols)
    zscore_outliers = detect_outliers_zscore(df, columns=analysis_cols)
    report["steps"].append({
        "step": "outlier_detection",
        "iqr_outliers": {
            col: info["count"] for col, info in iqr_outliers.items()
        },
        "zscore_outliers": {
            col: info["count"] for col, info in zscore_outliers.items()
        },
    })

    report["final_shape"] = df.shape

    return df, report
