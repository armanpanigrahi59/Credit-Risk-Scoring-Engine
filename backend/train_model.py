from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

MODEL_PATH = Path(__file__).with_name("model.pkl")
FEATURES = [
    "age",
    "annual_income",
    "employment_years",
    "credit_history_length",
    "num_credit_accounts",
    "debt_to_income_ratio",
    "loan_amount",
    "loan_purpose_encoded",
    "num_delinquencies",
    "payment_history_score",
]
LOAN_PURPOSES = {
    "home": 0,
    "auto": 1,
    "education": 2,
    "business": 3,
    "personal": 4,
    "debt_consolidation": 5,
}


def generate_dataset(rows: int = 4000) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    data = pd.DataFrame(
        {
            "age": rng.integers(21, 76, rows),
            "annual_income": rng.lognormal(mean=11.1, sigma=0.55, size=rows).clip(18000, 320000),
            "employment_years": rng.gamma(shape=2.6, scale=2.1, size=rows).clip(0, 35),
            "credit_history_length": rng.gamma(shape=3.0, scale=2.8, size=rows).clip(0, 40),
            "num_credit_accounts": rng.integers(0, 16, rows),
            "debt_to_income_ratio": rng.beta(2.3, 5.0, rows).clip(0.02, 0.95),
            "loan_amount": rng.lognormal(mean=10.5, sigma=0.75, size=rows).clip(1000, 250000),
            "loan_purpose_encoded": rng.integers(0, len(LOAN_PURPOSES), rows),
            "num_delinquencies": rng.poisson(0.8, rows).clip(0, 8),
            "payment_history_score": rng.normal(78, 13, rows).clip(20, 100),
        }
    )
    pressure = (
        1.9 * data["debt_to_income_ratio"]
        + 0.42 * data["num_delinquencies"]
        + (data["loan_amount"] / data["annual_income"]) * 0.35
        - data["payment_history_score"] / 90
        - data["credit_history_length"] / 45
        - data["employment_years"] / 55
    )
    low, high = np.quantile(pressure, [0.48, 0.78])
    data["risk_class"] = np.select([pressure <= low, pressure <= high], [0, 1], default=2)
    return data


def main() -> None:
    data = generate_dataset()
    x_train, x_test, y_train, y_test = train_test_split(
        data[FEATURES], data["risk_class"], test_size=0.2, stratify=data["risk_class"], random_state=42
    )
    model = XGBClassifier(
        objective="multi:softprob",
        num_class=3,
        n_estimators=160,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="mlogloss",
        random_state=42,
    )
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    print(classification_report(y_test, predictions, target_names=["LOW", "MEDIUM", "HIGH"]))
    joblib.dump({"model": model, "features": FEATURES, "loan_purposes": LOAN_PURPOSES}, MODEL_PATH)
    print(f"Saved {MODEL_PATH}")


if __name__ == "__main__":
    main()
