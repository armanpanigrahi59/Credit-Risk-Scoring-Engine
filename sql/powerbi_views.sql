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