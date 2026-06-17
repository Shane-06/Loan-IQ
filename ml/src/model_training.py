"""
Model Training Module for HDFC Bank Loan Approval System.

Handles:
- Train/Validation/Test split (70/15/15)
- RandomForestClassifier with GridSearchCV
- 5-fold cross-validation
- Hyperparameter tuning
- Model serialization with joblib (versioned)
"""

import os
import json
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import (
    GridSearchCV,
    StratifiedKFold,
    train_test_split,
)
import joblib


# Default hyperparameter grid for GridSearchCV
DEFAULT_PARAM_GRID = {
    "n_estimators": [50, 100, 200],
    "max_depth": [None, 10, 20, 30],
    "min_samples_split": [2, 5, 10],
    "min_samples_leaf": [1, 2, 4],
    "max_features": ["sqrt", "log2"],
}

# Reduced grid for faster training during development
FAST_PARAM_GRID = {
    "n_estimators": [50, 100],
    "max_depth": [None, 20],
    "min_samples_split": [2, 5],
    "min_samples_leaf": [1, 2],
    "max_features": ["sqrt"],
}


def split_data(
    df: pd.DataFrame,
    target_col: str = "loan_status",
    test_size: float = 0.15,
    val_size: float = 0.15,
    random_state: int = 42,
) -> dict[str, Any]:
    """
    Split data into train, validation, and test sets.

    Args:
        df: Feature-engineered DataFrame
        target_col: Name of target column
        test_size: Fraction for test set
        val_size: Fraction for validation set
        random_state: Random seed for reproducibility

    Returns:
        Dict with X_train, X_val, X_test, y_train, y_val, y_test and feature_names
    """
    X = df.drop(target_col, axis=1)
    y = df[target_col]

    # First split: train+val vs test
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )

    # Second split: train vs validation
    val_fraction = val_size / (1 - test_size)
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp,
        test_size=val_fraction,
        random_state=random_state,
        stratify=y_temp,
    )

    return {
        "X_train": X_train,
        "X_val": X_val,
        "X_test": X_test,
        "y_train": y_train,
        "y_val": y_val,
        "y_test": y_test,
        "feature_names": X.columns.tolist(),
    }


def train_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    param_grid: dict | None = None,
    cv_folds: int = 5,
    random_state: int = 42,
    fast_mode: bool = False,
) -> dict[str, Any]:
    """
    Train RandomForestClassifier with GridSearchCV.

    Args:
        X_train: Training features
        y_train: Training labels
        param_grid: Custom hyperparameter grid (optional)
        cv_folds: Number of cross-validation folds
        random_state: Random seed
        fast_mode: Use reduced grid for faster training

    Returns:
        Dict with 'model', 'best_params', 'cv_results', 'training_report'
    """
    if param_grid is None:
        param_grid = FAST_PARAM_GRID if fast_mode else DEFAULT_PARAM_GRID

    base_model = RandomForestClassifier(random_state=random_state)

    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=random_state)

    grid_search = GridSearchCV(
        estimator=base_model,
        param_grid=param_grid,
        cv=cv,
        scoring="accuracy",
        n_jobs=-1,
        verbose=1,
        return_train_score=True,
    )

    print(f"Starting GridSearchCV with {cv_folds}-fold CV...")
    print(f"Parameter grid: {param_grid}")
    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_
    best_params = grid_search.best_params_

    # Extract cross-validation results
    cv_results = grid_search.cv_results_
    best_idx = grid_search.best_index_

    cv_mean_score = float(cv_results["mean_test_score"][best_idx])
    cv_std_score = float(cv_results["std_test_score"][best_idx])
    cv_train_mean = float(cv_results["mean_train_score"][best_idx])

    training_report = {
        "best_params": best_params,
        "cv_folds": cv_folds,
        "cv_mean_accuracy": round(cv_mean_score, 6),
        "cv_std_accuracy": round(cv_std_score, 6),
        "cv_train_mean_accuracy": round(cv_train_mean, 6),
        "total_candidates_evaluated": len(cv_results["mean_test_score"]),
    }

    print(f"\nBest Parameters: {best_params}")
    print(f"CV Mean Accuracy: {cv_mean_score:.4f} (+/- {cv_std_score:.4f})")
    print(f"CV Train Mean Accuracy: {cv_train_mean:.4f}")

    return {
        "model": best_model,
        "best_params": best_params,
        "grid_search": grid_search,
        "training_report": training_report,
    }


def save_model(
    model: RandomForestClassifier,
    feature_names: list[str],
    training_report: dict[str, Any],
    models_dir: str = "ml/models",
) -> str:
    """
    Save trained model with metadata.

    Args:
        model: Trained RandomForestClassifier
        feature_names: List of feature column names
        training_report: Training report dict
        models_dir: Directory to save model artifacts

    Returns:
        Path to saved model file
    """
    os.makedirs(models_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_filename = f"rf_model_{timestamp}.pkl"
    model_path = os.path.join(models_dir, model_filename)

    # Save model with metadata
    artifact = {
        "model": model,
        "feature_names": feature_names,
        "training_report": training_report,
        "timestamp": timestamp,
        "model_type": "RandomForestClassifier",
    }

    joblib.dump(artifact, model_path)
    print(f"Model saved to: {model_path}")

    # Also save as 'latest' for easy loading
    latest_path = os.path.join(models_dir, "rf_model_latest.pkl")
    joblib.dump(artifact, latest_path)
    print(f"Latest model link: {latest_path}")

    # Save metadata as JSON
    meta_path = os.path.join(models_dir, f"rf_model_{timestamp}_meta.json")
    meta = {
        "feature_names": feature_names,
        "training_report": training_report,
        "timestamp": timestamp,
    }
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2, default=str)

    return model_path


def load_model(model_path: str = "ml/models/rf_model_latest.pkl") -> dict[str, Any]:
    """
    Load a saved model artifact.

    Returns:
        Dict with 'model', 'feature_names', 'training_report', etc.
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at: {model_path}")

    artifact = joblib.load(model_path)
    print(f"Model loaded from: {model_path}")
    return artifact
