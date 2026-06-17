from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    
    # Inputs
    no_of_dependents: int
    education: str
    self_employed: str
    income_annum: float
    loan_amount: float
    loan_term: int
    cibil_score: int
    
    # Real-world additional fields
    credit_utilization_ratio: float
    previous_defaults: int
    monthly_emi: float
    
    residential_assets_value: float
    commercial_assets_value: float
    luxury_assets_value: float
    bank_asset_value: float
    
    # Model Outputs
    prediction_result: int
    loan_status: str
    approval_probability: float
    explanation_data: Optional[List[Dict[str, Any]]] = None
    
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    # Automatically compute loan_status text representation
    @property
    def loan_status_text(self) -> str:
        return "Approved" if self.prediction_result == 1 else "Rejected"


class CibilBucketStats(BaseModel):
    bucket: str  # e.g., "Poor (300-549)", "Fair (550-649)", "Good (650-749)", "Excellent (750-900)"
    total: int
    approved: int
    rejected: int
    approval_rate: float


class AnalyticsResponse(BaseModel):
    total_applications: int
    approved_applications: int
    rejected_applications: int
    approval_rate: float
    
    # Financial Averages
    average_loan_amount: float
    average_income: float
    average_cibil_score: float
    
    # Distribution and Breakdown Data
    cibil_stats: List[CibilBucketStats]
    loan_term_distribution: Dict[str, int]  # e.g., {"5": 10, "10": 25...}
    approval_by_education: Dict[str, float]  # e.g., {"graduate": 0.85, "not graduate": 0.40}
    approval_by_employment: Dict[str, float]  # e.g., {"yes": 0.65, "no": 0.66}
    
    # Monthly Application Volume Trend (recent 6 months)
    monthly_trends: List[Dict[str, Any]]  # e.g., [{"month": "Jan", "total": 20, "approved": 15}]
