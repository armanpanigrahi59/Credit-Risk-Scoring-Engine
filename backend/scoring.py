from pathlib import Path

import joblib
import numpy as np
import pandas as pd

try:
    import shap
except Exception:  # pragma: no cover - SHAP is optional at runtime
    shap = None

from schemas import ApplicantInput, ScoreResult, TopFeature
from train_model import FEATURES, LOAN_PURPOSES

MODEL_PATH = Path(__file__).with_name("model.pkl")
MODEL_BUNDLE = None
CLASS_LABELS = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}


def load_bundle():
    global MODEL_BUNDLE
    if MODEL_BUNDLE is None:
        if not MODEL_PATH.exists():
            raise RuntimeError("Model file is missing. Run `python train_model.py` first.")
        MODEL_BUNDLE = joblib.load(MODEL_PATH)
    return MODEL_BUNDLE


def applicant_frame(applicant: ApplicantInput) -> pd.DataFrame:
    purpose_key = applicant.loan_purpose.lower().replace(" ", "_")
    row = {
        "age": applicant.age,
        "annual_income": applicant.annual_income,
        "employment_years": applicant.employment_years,
        "credit_history_length": applicant.credit_history_length,
        "num_credit_accounts": applicant.num_credit_accounts,
        "debt_to_income_ratio": applicant.debt_to_income_ratio,
        "loan_amount": applicant.loan_amount,
        "loan_purpose_encoded": LOAN_PURPOSES.get(purpose_key, LOAN_PURPOSES["personal"]),
        "num_delinquencies": applicant.num_delinquencies,
        "payment_history_score": applicant.payment_history_score,
    }
    return pd.DataFrame([row], columns=FEATURES)


def fallback_impacts(frame: pd.DataFrame) -> list[TopFeature]:
    row = frame.iloc[0]
    impacts = {
        "payment_history_score": round((row["payment_history_score"] - 72) / 100, 3),
        "debt_to_income_ratio": round(-row["debt_to_income_ratio"], 3),
        "num_delinquencies": round(-row["num_delinquencies"] / 8, 3),
        "credit_history_length": round(row["credit_history_length"] / 40, 3),
        "annual_income": round(min(row["annual_income"] / 250000, 1), 3),
    }
    return [TopFeature(feature=name, impact=value) for name, value in sorted(impacts.items(), key=lambda item: abs(item[1]), reverse=True)]


def top_feature_impacts(model, frame: pd.DataFrame, predicted_class: int) -> list[TopFeature]:
    if shap is None:
        return fallback_impacts(frame)
    try:
        explainer = shap.TreeExplainer(model)
        values = explainer.shap_values(frame)
        class_values = values[predicted_class][0] if isinstance(values, list) else values[0, :, predicted_class]
        pairs = sorted(zip(FEATURES, class_values), key=lambda item: abs(float(item[1])), reverse=True)[:5]
        return [TopFeature(feature=name, impact=round(float(value), 3)) for name, value in pairs]
    except Exception:
        return fallback_impacts(frame)


def score_application(applicant: ApplicantInput) -> ScoreResult:
    bundle = load_bundle()
    model = bundle["model"]
    frame = applicant_frame(applicant)
    probabilities = model.predict_proba(frame)[0]
    predicted_class = int(np.argmax(probabilities))
    risk_class = CLASS_LABELS[predicted_class]
    confidence = round(float(probabilities[predicted_class]) * 100, 1)

    base_score = {0: 755, 1: 635, 2: 515}[predicted_class]
    adjustment = int((applicant.payment_history_score - 75) * 1.3 - applicant.debt_to_income_ratio * 95 - applicant.num_delinquencies * 18)
    risk_score = int(np.clip(base_score + adjustment, 300, 850))

    if risk_class == "LOW" and risk_score >= 690:
        decision = "APPROVED"
        reasoning = "Strong repayment profile and manageable debt burden."
    elif risk_class == "HIGH" or risk_score < 580:
        decision = "REJECTED"
        reasoning = "Default risk is elevated based on credit behavior and affordability signals."
    else:
        decision = "MANUAL REVIEW"
        reasoning = "Applicant has mixed signals that need underwriter review."

    return ScoreResult(
        risk_score=risk_score,
        risk_class=risk_class,
        confidence=confidence,
        decision=decision,
        top_features=top_feature_impacts(model, frame, predicted_class),
        reasoning=reasoning,
    )
