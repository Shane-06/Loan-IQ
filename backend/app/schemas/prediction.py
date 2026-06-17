from typing import Any, Dict
from pydantic import BaseModel, Field, field_validator


class PredictionRequest(BaseModel):
    no_of_dependents: int = Field(..., ge=0, le=20, description="Number of dependents of the applicant")
    education: str = Field(..., description="Education level: 'graduate' or 'not graduate'")
    self_employed: str = Field(..., description="Self-employment status: 'yes' or 'no'")
    income_annum: float = Field(..., ge=0, description="Annual income in INR")
    loan_amount: float = Field(..., ge=0, description="Requested loan amount in INR")
    loan_term: int = Field(..., ge=1, le=40, description="Loan term in years")
    cibil_score: int = Field(..., ge=300, le=900, description="CIBIL score (300 to 900)")
    
    # Real-world additional fields
    credit_utilization_ratio: float = Field(..., ge=0.0, le=1.5, description="Credit card utilization ratio (0.0 to 1.5)")
    previous_defaults: int = Field(..., ge=0, le=20, description="Count of past defaults")
    monthly_emi: float = Field(..., ge=0.0, description="Existing monthly debt payments (EMI) in INR")
    residential_assets_value: float = Field(..., ge=-100000000, description="Residential assets value in INR")
    commercial_assets_value: float = Field(..., ge=-100000000, description="Commercial assets value in INR")
    luxury_assets_value: float = Field(..., ge=-100000000, description="Luxury assets value in INR")
    bank_asset_value: float = Field(..., ge=-100000000, description="Bank asset value in INR")

    @field_validator("education")
    @classmethod
    def validate_education(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if v_clean not in ["graduate", "not graduate"]:
            raise ValueError("Education must be 'graduate' or 'not graduate'")
        return v_clean

    @field_validator("self_employed")
    @classmethod
    def validate_self_employed(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if v_clean not in ["yes", "no"]:
            raise ValueError("Self employed must be 'yes' or 'no'")
        return v_clean


class PredictionResponse(BaseModel):
    prediction_result: int  # 1 for Approved, 0 for Rejected
    loan_status: str  # "Approved" or "Rejected"
    approval_probability: float  # probability of approval (0.0 to 1.0)
    explanation: list[dict[str, Any]]  # Key factors driving prediction
    decision_message: str  # A friendly explainable reason text
