from datetime import datetime
from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Raw features from dataset
    no_of_dependents: Mapped[int] = mapped_column(Integer, nullable=False)
    education: Mapped[str] = mapped_column(String, nullable=False)  # "graduate" or "not graduate"
    self_employed: Mapped[str] = mapped_column(String, nullable=False)  # "yes" or "no"
    income_annum: Mapped[float] = mapped_column(Float, nullable=False)
    loan_amount: Mapped[float] = mapped_column(Float, nullable=False)
    loan_term: Mapped[int] = mapped_column(Integer, nullable=False)  # in years
    cibil_score: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Real-world additional fields
    credit_utilization_ratio: Mapped[float] = mapped_column(Float, nullable=False, default=0.3)
    previous_defaults: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    monthly_emi: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    
    # Asset Values
    residential_assets_value: Mapped[float] = mapped_column(Float, nullable=False)
    commercial_assets_value: Mapped[float] = mapped_column(Float, nullable=False)
    luxury_assets_value: Mapped[float] = mapped_column(Float, nullable=False)
    bank_asset_value: Mapped[float] = mapped_column(Float, nullable=False)
    
    # Model Output Results
    prediction_result: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 for Approved, 0 for Rejected
    approval_probability: Mapped[float] = mapped_column(Float, nullable=False)
    explanation_data: Mapped[dict] = mapped_column(JSON, nullable=True)  # Explainable AI results (JSON)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="applications")

    @property
    def loan_status(self) -> str:
        """Helper to return a string representation of prediction_result."""
        return "Approved" if self.prediction_result == 1 else "Rejected"
