from __future__ import annotations

import json
import time
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.features import assign_risk_tier, ensure_feature_frame
from src.india_loan import applicant_to_india_frame
from src.schemas import ApplicantFeatures, IndiaLoanApplicant, ScoreResponse

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "credit_risk_model.joblib"
METRICS_PATH = ROOT / "models" / "metrics.json"
INDIA_MODEL_PATH = ROOT / "models" / "india_loan_model.joblib"
INDIA_METRICS_PATH = ROOT / "models" / "india_loan_metrics.json"

app = FastAPI(
    title="Credit Risk Scoring Engine",
    description="Real-time default risk scoring API trained on the UCI/OpenML credit default dataset.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_model():
    if not MODEL_PATH.exists():
        raise RuntimeError("Model file is missing. Run `python -m src.train` first.")
    return joblib.load(MODEL_PATH)


def load_india_model():
    if not INDIA_MODEL_PATH.exists():
        raise RuntimeError("India loan model file is missing. Run `python -m src.train_india_loan` first.")
    return joblib.load(INDIA_MODEL_PATH)


model = None
metrics = {}
india_model = None
india_metrics = {}


@app.on_event("startup")
def startup() -> None:
    global model, metrics, india_model, india_metrics
    model = load_model()
    if METRICS_PATH.exists():
        metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    if INDIA_MODEL_PATH.exists():
        india_model = load_india_model()
    if INDIA_METRICS_PATH.exists():
        india_metrics = json.loads(INDIA_METRICS_PATH.read_text(encoding="utf-8"))


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "selected_model": metrics.get("selected_model"),
        "auc_roc": metrics.get("selected_auc_roc"),
        "india_model_loaded": india_model is not None,
        "india_selected_model": india_metrics.get("selected_model"),
        "india_auc_roc": india_metrics.get("selected_auc_roc"),
    }


@app.get("/metrics")
def model_metrics() -> dict:
    if not metrics:
        raise HTTPException(status_code=404, detail="Model metrics are missing. Run `python -m src.train` first.")
    return metrics


@app.get("/india/metrics")
def india_model_metrics() -> dict:
    if not india_metrics:
        raise HTTPException(status_code=404, detail="India loan model metrics are missing. Run `python -m src.train_india_loan` first.")
    return india_metrics


@app.post("/score", response_model=ScoreResponse)
def score_applicant(applicant: ApplicantFeatures) -> ScoreResponse:
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    started = time.perf_counter()
    frame = ensure_feature_frame(applicant.model_dump())
    probability = float(model.predict_proba(frame)[0, 1])
    response_time_ms = round((time.perf_counter() - started) * 1000, 3)
    risk_tier = assign_risk_tier(probability)
    decision = "manual_review" if probability >= 0.45 else "approve"
    if probability >= 0.70:
        decision = "decline"

    return ScoreResponse(
        default_probability=round(probability, 4),
        risk_tier=risk_tier,
        decision=decision,
        model_version=metrics.get("selected_model", "unknown"),
        response_time_ms=response_time_ms,
    )


@app.post("/india/score", response_model=ScoreResponse)
def score_india_loan(applicant: IndiaLoanApplicant) -> ScoreResponse:
    if india_model is None:
        raise HTTPException(status_code=503, detail="India loan model is not loaded.")

    started = time.perf_counter()
    frame = applicant_to_india_frame(applicant.model_dump())
    probability = float(india_model.predict_proba(frame)[0, 1])
    response_time_ms = round((time.perf_counter() - started) * 1000, 3)
    risk_tier = assign_risk_tier(probability)
    decision = "manual_review" if probability >= 0.35 else "approve"
    if probability >= 0.65:
        decision = "decline"

    return ScoreResponse(
        default_probability=round(probability, 4),
        risk_tier=risk_tier,
        decision=decision,
        model_version=india_metrics.get("selected_model", "unknown"),
        response_time_ms=response_time_ms,
    )
