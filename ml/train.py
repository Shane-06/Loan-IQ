"""
Main Training Orchestrator for HDFC Bank Loan Approval System.

Runs the full ML pipeline:
1. Load raw CSV
2. Data cleaning
3. Feature engineering
4. Train/Val/Test split
5. Model training with GridSearchCV
6. Model evaluation
7. Model monitoring
8. Save model artifact + evaluation report

Usage:
    python ml/train.py                  # Full training (default grid)
    python ml/train.py --fast           # Fast mode (reduced grid)
"""

import os
import sys
import json
import argparse
from datetime import datetime

import pandas as pd

# Add project root to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.src.data_cleaning import clean_data
from ml.src.feature_engineering import engineer_features
from ml.src.model_training import split_data, train_model, save_model
from ml.src.model_evaluation import evaluate_model, print_evaluation_summary
from ml.src.model_monitoring import run_full_monitoring, print_monitoring_summary
from ml.src.explainability import get_global_feature_importance


def main(fast_mode: bool = False) -> None:
    """Run the full training pipeline."""
    print("=" * 60)
    print("HDFC BANK LOAN APPROVAL SYSTEM - MODEL TRAINING PIPELINE")
    print("=" * 60)
    print(f"Mode: {'FAST' if fast_mode else 'FULL'}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # ---- Step 1: Load Data ----
    print("Step 1: Loading data...")
    data_path = os.path.join(PROJECT_ROOT, "loan_approval_dataset.csv")
    if not os.path.exists(data_path):
        # Try alternate location
        data_path = os.path.join(PROJECT_ROOT, "ml", "data", "loan_approval_dataset.csv")
    if not os.path.exists(data_path):
        print(f"ERROR: Dataset not found. Tried:")
        print(f"  - {os.path.join(PROJECT_ROOT, 'loan_approval_dataset.csv')}")
        print(f"  - {data_path}")
        sys.exit(1)

    df = pd.read_csv(data_path)
    print(f"  Loaded {df.shape[0]} rows × {df.shape[1]} columns")
    print()

    # ---- Step 2: Data Cleaning ----
    print("Step 2: Data cleaning...")
    df_clean, cleaning_report = clean_data(df)
    print(f"  Original shape: {cleaning_report['original_shape']}")
    print(f"  Final shape:    {cleaning_report['final_shape']}")
    for step in cleaning_report["steps"]:
        step_name = step["step"]
        if "duplicates_removed" in step:
            print(f"  - {step_name}: {step['duplicates_removed']} duplicates removed")
        elif "values_clipped" in step:
            print(f"  - {step_name}: {step['values_clipped']} values clipped")
        elif "columns_with_missing" in step:
            if step["columns_with_missing"]:
                print(f"  - {step_name}: {step['columns_with_missing']}")
            else:
                print(f"  - {step_name}: No missing values")
        else:
            print(f"  - {step_name}: Done")
    print()

    # ---- Step 3: Feature Engineering ----
    print("Step 3: Feature engineering...")
    df_engineered, fe_report = engineer_features(df_clean)
    print(f"  Features created: {', '.join(fe_report['features_created'])}")
    if fe_report.get("dropped_columns"):
        print(f"  Columns dropped: {', '.join(fe_report['dropped_columns'])}")
    print(f"  Final columns: {fe_report['final_columns']}")

    corr = fe_report.get("correlation_analysis", {})
    high_corr = corr.get("high_correlations", [])
    if high_corr:
        print(f"  High correlations (|r| > 0.7):")
        for hc in high_corr[:5]:
            print(f"    {hc['feature_1']} <-> {hc['feature_2']}: {hc['correlation']:.4f}")
    print()

    # ---- Step 4: Split Data ----
    print("Step 4: Splitting data (70/15/15)...")
    splits = split_data(df_engineered)
    print(f"  Train:      {len(splits['X_train'])} samples")
    print(f"  Validation: {len(splits['X_val'])} samples")
    print(f"  Test:       {len(splits['X_test'])} samples")
    print(f"  Features:   {len(splits['feature_names'])}")
    print()

    # ---- Step 5: Train Model ----
    print("Step 5: Training model with GridSearchCV...")
    train_result = train_model(
        splits["X_train"],
        splits["y_train"],
        fast_mode=fast_mode,
    )
    model = train_result["model"]
    print()

    # ---- Step 6: Evaluate Model ----
    print("Step 6: Evaluating model...")
    eval_metrics = evaluate_model(
        model,
        splits["X_train"], splits["y_train"],
        splits["X_val"], splits["y_val"],
        splits["X_test"], splits["y_test"],
    )
    print_evaluation_summary(eval_metrics)

    # ---- Step 7: Model Monitoring ----
    print("\nStep 7: Running model health monitoring...")
    X_full = pd.concat([splits["X_train"], splits["X_val"]], axis=0)
    y_full = pd.concat([splits["y_train"], splits["y_val"]], axis=0)

    monitoring_report = run_full_monitoring(
        model=model,
        evaluation_metrics=eval_metrics,
        feature_names=splits["feature_names"],
        X_test=splits["X_test"],
        y_test=splits["y_test"],
        X_full=X_full,
        y_full=y_full,
    )
    print_monitoring_summary(monitoring_report)

    # ---- Step 8: Feature Importance (Explainability) ----
    print("\nStep 8: Extracting global feature importance...")
    feature_importance = get_global_feature_importance(
        model, splits["feature_names"]
    )
    print("\n  Global Feature Importance:")
    for fi in feature_importance:
        bar = "#" * int(fi["importance_pct"])
        print(f"    {fi['rank']:2d}. {fi['feature']:30s} {fi['importance_pct']:6.2f}% {bar}")

    # ---- Step 9: Save Model ----
    print("\n\nStep 9: Saving model artifacts...")
    models_dir = os.path.join(PROJECT_ROOT, "ml", "models")
    model_path = save_model(
        model=model,
        feature_names=splits["feature_names"],
        training_report=train_result["training_report"],
        models_dir=models_dir,
    )

    # ---- Step 10: Save Full Report ----
    reports_dir = os.path.join(PROJECT_ROOT, "ml", "reports")
    os.makedirs(reports_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = os.path.join(reports_dir, f"training_report_{timestamp}.json")

    full_report = {
        "timestamp": timestamp,
        "data_cleaning": cleaning_report,
        "feature_engineering": {
            k: v for k, v in fe_report.items()
            if k != "correlation_analysis"
        },
        "training": train_result["training_report"],
        "evaluation": eval_metrics,
        "monitoring": monitoring_report,
        "feature_importance": feature_importance,
        "model_path": model_path,
    }

    with open(report_path, "w") as f:
        json.dump(full_report, f, indent=2, default=str)
    print(f"Full report saved to: {report_path}")

    # ---- Summary ----
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    test_acc = eval_metrics["test"]["accuracy"]
    test_auc = eval_metrics["test"]["roc_auc"]
    print(f"  Test Accuracy: {test_acc:.4f} {'[OK]' if test_acc > 0.95 else '[FAIL]'}")
    print(f"  Test ROC-AUC:  {test_auc:.4f} {'[OK]' if test_auc > 0.95 else '[FAIL]'}")
    print(f"  CV Variance:   {eval_metrics['cross_validation']['cv_variance']:.6f}")
    print(f"  Health Status: {monitoring_report['overall_status'].upper()}")
    if monitoring_report["issues"]:
        for issue in monitoring_report["issues"]:
            print(f"    [!] {issue}")
    print(f"  Model saved:   {model_path}")
    print(f"  Report saved:  {report_path}")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Train the HDFC Bank Loan Approval model"
    )
    parser.add_argument(
        "--fast",
        action="store_true",
        help="Use reduced hyperparameter grid for faster training",
    )
    args = parser.parse_args()
    main(fast_mode=args.fast)
