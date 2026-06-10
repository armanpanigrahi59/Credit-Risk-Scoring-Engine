from __future__ import annotations

from pydantic import BaseModel, Field


class ApplicantFeatures(BaseModel):
    limit_bal: float = Field(..., ge=0, description="Credit limit balance.")
    sex: int = Field(..., ge=1, le=2)
    education: int = Field(..., ge=0, le=6)
    marriage: int = Field(..., ge=0, le=3)
    age: int = Field(..., ge=18, le=100)
    pay_0: int = Field(..., ge=-2, le=8)
    pay_2: int = Field(..., ge=-2, le=8)
    pay_3: int = Field(..., ge=-2, le=8)
    pay_4: int = Field(..., ge=-2, le=8)
    pay_5: int = Field(..., ge=-2, le=8)
    pay_6: int = Field(..., ge=-2, le=8)
    bill_amt1: float
    bill_amt2: float
    bill_amt3: float
    bill_amt4: float
    bill_amt5: float
    bill_amt6: float
    pay_amt1: float = Field(..., ge=0)
    pay_amt2: float = Field(..., ge=0)
    pay_amt3: float = Field(..., ge=0)
    pay_amt4: float = Field(..., ge=0)
    pay_amt5: float = Field(..., ge=0)
    pay_amt6: float = Field(..., ge=0)


class ScoreResponse(BaseModel):
    default_probability: float
    risk_tier: str
    decision: str
    model_version: str
    response_time_ms: float


class IndiaLoanApplicant(BaseModel):
    loan_amount_inr: float = Field(..., ge=10_000)
    annual_income_inr: float = Field(..., ge=50_000)
    property_value_inr: float = Field(..., ge=0)
    term_months: int = Field(..., ge=6, le=480)
    cibil_score: int = Field(..., ge=300, le=900)
    dti_ratio: float = Field(..., ge=0, le=100, description="Debt-to-income ratio as a percentage.")
    age_band: str = Field(default="35-44")
    gender: str = Field(default="Joint")
    region: str = Field(default="North")
    loan_product: str = Field(default="Home Loan")
    loan_purpose: str = Field(default="Home Purchase")
    employment_type: str = Field(default="Salaried")
    bureau_type: str = Field(default="CIBIL")
    co_applicant: bool = Field(default=True)
    pre_approved: bool = Field(default=False)
