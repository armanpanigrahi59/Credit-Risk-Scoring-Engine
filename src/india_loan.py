from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[1]
RAW_DATA_PATH = ROOT / "data" / "raw" / "loan_default_zenodo.csv"
SOURCE_URL = "https://zenodo.org/records/17833064"
DOWNLOAD_URL = "https://zenodo.org/records/17833064/files/Loan_Default.csv?download=1"

NUMERIC_COLUMNS = [
    "loan_amount",
    "income",
    "term",
    "Credit_Score",
    "property_value",
    "LTV",
    "dtir1",
    "income_to_loan",
    "loan_to_income",
    "property_cover",
    "emi_to_income_proxy",
]

CATEGORICAL_COLUMNS = [
    "Gender",
    "loan_limit",
    "approv_in_adv",
    "loan_type",
    "loan_purpose",
    "business_or_commercial",
    "credit_type",
    "co-applicant_credit_type",
    "age",
    "Region",
]

FEATURE_COLUMNS = NUMERIC_COLUMNS + CATEGORICAL_COLUMNS
TARGET_COLUMN = "Status"

AGE_BANDS = ["<25", "25-34", "35-44", "45-54", "55-64", "65-74", ">74"]


def add_india_loan_features(frame: pd.DataFrame) -> pd.DataFrame:
    enriched = frame.copy()
    income = enriched["income"].replace(0, np.nan)
    loan_amount = enriched["loan_amount"].replace(0, np.nan)
    property_value = enriched["property_value"].replace(0, np.nan)
    term_years = enriched["term"].replace(0, np.nan) / 12

    enriched["income_to_loan"] = (income / loan_amount).replace([np.inf, -np.inf], np.nan).fillna(0)
    enriched["loan_to_income"] = (loan_amount / income).replace([np.inf, -np.inf], np.nan).fillna(0)
    enriched["property_cover"] = (property_value / loan_amount).replace([np.inf, -np.inf], np.nan).fillna(0)
    enriched["emi_to_income_proxy"] = (loan_amount / term_years / income).replace([np.inf, -np.inf], np.nan).fillna(0)
    return enriched


def load_india_loan_data() -> tuple[pd.DataFrame, pd.Series]:
    if not RAW_DATA_PATH.exists():
        RAW_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        pd.read_csv(DOWNLOAD_URL).to_csv(RAW_DATA_PATH, index=False)

    frame = pd.read_csv(RAW_DATA_PATH)
    missing = sorted(set(["loan_amount", "income", "term", "Credit_Score", TARGET_COLUMN]) - set(frame.columns))
    if missing:
        raise ValueError(f"India loan dataset is missing expected columns: {missing}")

    usable = frame[[
        "loan_amount",
        "income",
        "term",
        "Credit_Score",
        "property_value",
        "LTV",
        "dtir1",
        "Gender",
        "loan_limit",
        "approv_in_adv",
        "loan_type",
        "loan_purpose",
        "business_or_commercial",
        "credit_type",
        "co-applicant_credit_type",
        "age",
        "Region",
        TARGET_COLUMN,
    ]].copy()

    for column in ["loan_amount", "income", "term", "Credit_Score", "property_value", "LTV", "dtir1"]:
        usable[column] = pd.to_numeric(usable[column], errors="coerce")

    usable = add_india_loan_features(usable)
    X = usable[FEATURE_COLUMNS]
    y = usable[TARGET_COLUMN].astype(int)
    return X, y


def build_india_preprocessor() -> ColumnTransformer:
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
            ("numeric", numeric_pipeline, NUMERIC_COLUMNS),
            ("categorical", categorical_pipeline, CATEGORICAL_COLUMNS),
        ]
    )


def applicant_to_india_frame(payload: dict) -> pd.DataFrame:
    loan_amount = float(payload["loan_amount_inr"])
    annual_income = float(payload["annual_income_inr"])
    monthly_income = annual_income / 12
    property_value = float(payload.get("property_value_inr") or max(loan_amount / 0.8, loan_amount))
    term_months = float(payload["term_months"])
    dti_ratio = float(payload["dti_ratio"])
    ltv = (loan_amount / property_value) * 100 if property_value else np.nan

    row = {
        "loan_amount": loan_amount / 100,
        "income": monthly_income / 100,
        "term": term_months,
        "Credit_Score": int(payload["cibil_score"]),
        "property_value": property_value / 100,
        "LTV": ltv,
        "dtir1": dti_ratio,
        "Gender": payload.get("gender", "Joint"),
        "loan_limit": "cf",
        "approv_in_adv": "pre" if payload.get("pre_approved") else "nopre",
        "loan_type": map_loan_type(payload.get("loan_product", "Home Loan")),
        "loan_purpose": map_loan_purpose(payload.get("loan_purpose", "Home Purchase")),
        "business_or_commercial": "b/c" if payload.get("employment_type") == "Self-employed" else "nob/c",
        "credit_type": map_credit_bureau(payload.get("bureau_type", "CIBIL")),
        "co-applicant_credit_type": "CIB" if payload.get("co_applicant") else "EXP",
        "age": payload.get("age_band", "35-44"),
        "Region": payload.get("region", "North"),
    }
    frame = pd.DataFrame([row])
    return add_india_loan_features(frame)[FEATURE_COLUMNS]


def map_loan_type(value: str) -> str:
    mapping = {
        "Home Loan": "type1",
        "Vehicle Loan": "type2",
        "Personal Loan": "type3",
        "Business Loan": "type2",
    }
    return mapping.get(value, "type1")


def map_loan_purpose(value: str) -> str:
    mapping = {
        "Home Purchase": "p1",
        "Balance Transfer": "p2",
        "Home Improvement": "p3",
        "Business Expansion": "p4",
        "Vehicle Purchase": "p3",
        "Personal Use": "p4",
    }
    return mapping.get(value, "p1")


def map_credit_bureau(value: str) -> str:
    mapping = {
        "CIBIL": "CIB",
        "Experian": "EXP",
        "CRIF": "CRIF",
        "Equifax": "EQUI",
    }
    return mapping.get(value, "CIB")
