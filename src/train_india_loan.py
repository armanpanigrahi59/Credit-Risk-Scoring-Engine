from __future__ import annotations

import json
import time
from pathlib import Path

import joblib
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, average_precision_score, classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from src.india_loan import (
    CATEGORICAL_COLUMNS,
    FEATURE_COLUMNS,
    NUMERIC_COLUMNS,
    SOURCE_URL,
    build_india_preprocessor,
    load_india_loan_data,
)

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "india_loan_model.joblib"
METRICS_PATH = ROOT / "models" / "india_loan_metrics.json"


def build_candidates() -> dict[str, Pipeline]:
    def candidate(classifier) -> Pipeline:
        return Pipeline(
            steps=[
                ("preprocessor", build_india_preprocessor()),
                ("classifier", classifier),
            ]
        )

    return {
        "logistic_regression": candidate(
            LogisticRegression(max_iter=2000, class_weight="balanced", solver="lbfgs")
        ),
        "random_forest": candidate(
            RandomForestClassifier(
                n_estimators=450,
                max_features="sqrt",
                min_samples_leaf=10,
                class_weight="balanced_subsample",
                random_state=42,
                n_jobs=-1,
            )
        ),
        "extra_trees": candidate(
            ExtraTreesClassifier(
                n_estimators=450,
                max_features="sqrt",
                min_samples_leaf=10,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1,
            )
        ),
        "hist_gradient_boosting": candidate(
            HistGradientBoostingClassifier(
                learning_rate=0.05,
                max_iter=260,
                max_leaf_nodes=24,
                l2_regularization=0.08,
                random_state=42,
            )
        ),
    }


def evaluate_model(model: Pipeline, X_test, y_test) -> dict:
    started = time.perf_counter()
    probabilities = model.predict_proba(X_test)[:, 1]
    latency_ms = ((time.perf_counter() - started) / len(X_test)) * 1000
    predictions = (probabilities >= 0.5).astype(int)
    return {
        "auc_roc": round(float(roc_auc_score(y_test, probabilities)), 4),
        "average_precision": round(float(average_precision_score(y_test, probabilities)), 4),
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "avg_batch_latency_ms_per_record": round(float(latency_ms), 4),
        "classification_report": classification_report(y_test, predictions, output_dict=True),
    }


def main() -> None:
    X, y = load_india_loan_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    metrics = {
        "dataset": {
            "name": "Loan Default Data",
            "source": "Zenodo / originally Kaggle",
            "source_url": SOURCE_URL,
            "records": int(len(X)),
            "features": len(FEATURE_COLUMNS),
            "numeric_features": len(NUMERIC_COLUMNS),
            "categorical_features": len(CATEGORICAL_COLUMNS),
            "positive_default_rate": round(float(y.mean()), 4),
            "localization_note": "Input labels and rupee scaling are India-focused; the public dataset is not a private Indian bureau dataset.",
        },
        "models": {},
    }

    best_name = None
    best_model = None
    best_auc = -1.0

    for name, model in build_candidates().items():
        model.fit(X_train, y_train)
        model_metrics = evaluate_model(model, X_test, y_test)
        metrics["models"][name] = model_metrics
        if model_metrics["auc_roc"] > best_auc:
            best_name = name
            best_model = model
            best_auc = model_metrics["auc_roc"]

    if best_model is None or best_name is None:
        raise RuntimeError("No trained India loan model was selected.")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_model, MODEL_PATH)

    metrics["selected_model"] = best_name
    metrics["selected_auc_roc"] = best_auc
    metrics["model_path"] = str(MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
