from __future__ import annotations

from typing import Iterable

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


FEATURE_COLUMNS = [
    "limit_bal",
    "sex",
    "education",
    "marriage",
    "age",
    "pay_0",
    "pay_2",
    "pay_3",
    "pay_4",
    "pay_5",
    "pay_6",
    "bill_amt1",
    "bill_amt2",
    "bill_amt3",
    "bill_amt4",
    "bill_amt5",
    "bill_amt6",
    "pay_amt1",
    "pay_amt2",
    "pay_amt3",
    "pay_amt4",
    "pay_amt5",
    "pay_amt6",
]

CATEGORICAL_COLUMNS = [
    "sex",
    "education",
    "marriage",
    "pay_0",
    "pay_2",
    "pay_3",
    "pay_4",
    "pay_5",
    "pay_6",
]

NUMERIC_COLUMNS = [column for column in FEATURE_COLUMNS if column not in CATEGORICAL_COLUMNS]

REPAYMENT_STATUS_COLUMNS = ["pay_0", "pay_2", "pay_3", "pay_4", "pay_5", "pay_6"]
BILL_AMOUNT_COLUMNS = ["bill_amt1", "bill_amt2", "bill_amt3", "bill_amt4", "bill_amt5", "bill_amt6"]
PAYMENT_AMOUNT_COLUMNS = ["pay_amt1", "pay_amt2", "pay_amt3", "pay_amt4", "pay_amt5", "pay_amt6"]

ENGINEERED_NUMERIC_COLUMNS = [
    "avg_repayment_status",
    "max_repayment_status",
    "delinquency_months",
    "severe_delinquency_months",
    "latest_bill_to_limit",
    "avg_bill_to_limit",
    "total_payment_to_bill",
    "recent_payment_to_bill",
    "bill_trend_6m",
    "payment_trend_6m",
    "avg_payment_amount",
    "total_bill_amount",
]

MODEL_NUMERIC_COLUMNS = NUMERIC_COLUMNS + ENGINEERED_NUMERIC_COLUMNS


def add_credit_behavior_features(frame: pd.DataFrame) -> pd.DataFrame:
    """Add repayment behavior features before model preprocessing."""
    enriched = frame.copy()
    safe_limit = enriched["limit_bal"].replace(0, np.nan)

    repayment = enriched[REPAYMENT_STATUS_COLUMNS]
    bills = enriched[BILL_AMOUNT_COLUMNS]
    payments = enriched[PAYMENT_AMOUNT_COLUMNS]

    total_bill = bills.sum(axis=1)
    total_payment = payments.sum(axis=1)
    latest_bill = enriched["bill_amt1"]
    recent_payment = enriched["pay_amt1"]

    enriched["avg_repayment_status"] = repayment.mean(axis=1)
    enriched["max_repayment_status"] = repayment.max(axis=1)
    enriched["delinquency_months"] = repayment.gt(0).sum(axis=1)
    enriched["severe_delinquency_months"] = repayment.ge(2).sum(axis=1)
    enriched["latest_bill_to_limit"] = (latest_bill / safe_limit).replace([np.inf, -np.inf], np.nan).fillna(0)
    enriched["avg_bill_to_limit"] = (bills.mean(axis=1) / safe_limit).replace([np.inf, -np.inf], np.nan).fillna(0)
    enriched["total_payment_to_bill"] = (total_payment / total_bill.replace(0, np.nan)).replace([np.inf, -np.inf], np.nan).fillna(0)
    enriched["recent_payment_to_bill"] = (recent_payment / latest_bill.replace(0, np.nan)).replace([np.inf, -np.inf], np.nan).fillna(0)
    enriched["bill_trend_6m"] = enriched["bill_amt1"] - enriched["bill_amt6"]
    enriched["payment_trend_6m"] = enriched["pay_amt1"] - enriched["pay_amt6"]
    enriched["avg_payment_amount"] = payments.mean(axis=1)
    enriched["total_bill_amount"] = total_bill

    return enriched


def build_preprocessor() -> ColumnTransformer:
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, MODEL_NUMERIC_COLUMNS),
            ("categorical", categorical_pipeline, CATEGORICAL_COLUMNS),
        ]
    )


def normalize_columns(columns: Iterable[str]) -> list[str]:
    normalized = []
    for column in columns:
        cleaned = (
            str(column)
            .strip()
            .lower()
            .replace(" ", "_")
            .replace(".", "_")
            .replace("-", "_")
        )
        normalized.append(cleaned)
    return normalized


def assign_risk_tier(probability: float) -> str:
    if probability < 0.20:
        return "Low"
    if probability < 0.45:
        return "Medium"
    if probability < 0.70:
        return "High"
    return "Critical"


def assign_income_bracket_proxy(limit_balance: float) -> str:
    if limit_balance < 50_000:
        return "Entry"
    if limit_balance < 150_000:
        return "Mass"
    if limit_balance < 300_000:
        return "Affluent"
    return "High Net Worth"


def assign_loan_type_proxy(limit_balance: float) -> str:
    if limit_balance < 80_000:
        return "Personal"
    if limit_balance < 220_000:
        return "Auto"
    if limit_balance < 450_000:
        return "Home Improvement"
    return "Mortgage"


def ensure_feature_frame(payload: dict) -> pd.DataFrame:
    row = {column: payload[column] for column in FEATURE_COLUMNS}
    return pd.DataFrame([row], columns=FEATURE_COLUMNS)


def score_frame(model, frame: pd.DataFrame) -> np.ndarray:
    probabilities = model.predict_proba(frame[FEATURE_COLUMNS])[:, 1]
    return probabilities
