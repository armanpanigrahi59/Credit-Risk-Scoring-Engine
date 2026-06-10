from __future__ import annotations

import pandas as pd
from sklearn.datasets import fetch_openml

from src.features import FEATURE_COLUMNS, normalize_columns

OPENML_DATA_ID = 42477
FALLBACK_CSV_URL = "https://huggingface.co/datasets/scikit-learn/credit-card-clients/resolve/main/UCI_Credit_Card.csv"
TARGET_COLUMN = "default"


def load_credit_default_data() -> tuple[pd.DataFrame, pd.Series]:
    try:
        dataset = fetch_openml(data_id=OPENML_DATA_ID, as_frame=True, parser="auto")
        frame = dataset.frame.copy()
    except Exception as exc:
        print(f"OpenML download failed ({exc}). Falling back to UCI CSV mirror.")
        frame = pd.read_csv(FALLBACK_CSV_URL)

    frame.columns = normalize_columns(frame.columns)

    target_candidates = ["y", "default_payment_next_month", "default"]
    target_column = next((column for column in target_candidates if column in frame.columns), None)
    if target_column is None:
        raise ValueError(f"Could not find default target in columns: {list(frame.columns)}")

    if "id" in frame.columns:
        frame = frame.drop(columns=["id"])

    frame = frame.rename(columns={target_column: TARGET_COLUMN})
    missing = sorted(set(FEATURE_COLUMNS + [TARGET_COLUMN]) - set(frame.columns))
    if missing:
        raise ValueError(f"Dataset is missing expected columns: {missing}")

    X = frame[FEATURE_COLUMNS].apply(pd.to_numeric, errors="coerce")
    y = frame[TARGET_COLUMN].astype(int)
    return X, y
