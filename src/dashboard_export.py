from __future__ import annotations

import sqlite3
from pathlib import Path

import pandas as pd

from src.features import (
    FEATURE_COLUMNS,
    assign_income_bracket_proxy,
    assign_loan_type_proxy,
    assign_risk_tier,
    score_frame,
)

ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = ROOT / "data" / "processed"
DB_PATH = PROCESSED_DIR / "credit_risk.db"
DASHBOARD_CSV_PATH = PROCESSED_DIR / "dashboard_credit_risk.csv"
SCORED_CSV_PATH = PROCESSED_DIR / "scored_applicants.csv"
SQL_PATH = ROOT / "sql" / "powerbi_views.sql"


def export_dashboard_assets(model, X: pd.DataFrame, y: pd.Series) -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    SQL_PATH.parent.mkdir(parents=True, exist_ok=True)

    scored = X[FEATURE_COLUMNS].copy()
    scored["actual_default"] = y.to_numpy()
    scored["risk_score"] = score_frame(model, scored)
    scored["risk_tier"] = scored["risk_score"].map(assign_risk_tier)
    scored["income_bracket"] = scored["limit_bal"].map(assign_income_bracket_proxy)
    scored["loan_type"] = scored["limit_bal"].map(assign_loan_type_proxy)
    scored["applicant_id"] = range(1, len(scored) + 1)

    dashboard = (
        scored.groupby(["risk_tier", "income_bracket", "loan_type"], observed=True)
        .agg(
            applicants=("applicant_id", "count"),
            default_rate=("actual_default", "mean"),
            avg_risk_score=("risk_score", "mean"),
            avg_credit_limit=("limit_bal", "mean"),
        )
        .reset_index()
    )

    scored.to_csv(SCORED_CSV_PATH, index=False)
    dashboard.to_csv(DASHBOARD_CSV_PATH, index=False)

    with sqlite3.connect(DB_PATH) as connection:
        scored.to_sql("scored_applicants", connection, if_exists="replace", index=False)
        dashboard.to_sql("dashboard_credit_risk", connection, if_exists="replace", index=False)
        for statement in sql_view_script().split(";"):
            statement = statement.strip()
            if statement:
                connection.execute(statement)

    SQL_PATH.write_text(sql_view_script(), encoding="utf-8")


def sql_view_script() -> str:
    return """
CREATE VIEW IF NOT EXISTS vw_default_by_risk_tier AS
SELECT
    risk_tier,
    COUNT(*) AS applicants,
    AVG(actual_default) AS default_rate,
    AVG(risk_score) AS avg_risk_score
FROM scored_applicants
GROUP BY risk_tier;

CREATE VIEW IF NOT EXISTS vw_default_by_income_bracket AS
SELECT
    income_bracket,
    COUNT(*) AS applicants,
    AVG(actual_default) AS default_rate,
    AVG(risk_score) AS avg_risk_score,
    AVG(limit_bal) AS avg_credit_limit
FROM scored_applicants
GROUP BY income_bracket;

CREATE VIEW IF NOT EXISTS vw_default_by_loan_type AS
SELECT
    loan_type,
    risk_tier,
    COUNT(*) AS applicants,
    AVG(actual_default) AS default_rate,
    AVG(risk_score) AS avg_risk_score
FROM scored_applicants
GROUP BY loan_type, risk_tier;
""".strip()
