from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ApplicantInput(BaseModel):
    name: str = Field(min_length=2)
    age: int = Field(ge=18, le=85)
    employment_type: str
    annual_income: float = Field(gt=0)
    employment_years: float = Field(ge=0, default=3)
    credit_history_length: float = Field(ge=0)
    num_credit_accounts: int = Field(ge=0, default=4)
    debt_to_income_ratio: float = Field(ge=0, le=1)
    existing_loans: int = Field(ge=0)
    num_delinquencies: int = Field(ge=0)
    payment_history_score: float = Field(ge=0, le=100, default=82)
    loan_amount: float = Field(gt=0)
    loan_purpose: str
    tenure: int = Field(ge=6, le=480)


class TopFeature(BaseModel):
    feature: str
    impact: float


class ScoreResult(BaseModel):
    risk_score: int
    risk_class: Literal["LOW", "MEDIUM", "HIGH"]
    confidence: float
    decision: Literal["APPROVED", "REJECTED", "MANUAL REVIEW"]
    top_features: list[TopFeature]
    reasoning: str


class ApplicationRead(BaseModel):
    id: int
    user_id: int
    applicant_data: dict[str, Any]
    score_result: dict[str, Any]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
