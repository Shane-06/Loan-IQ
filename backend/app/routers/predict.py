from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.application import LoanApplication
from app.middleware.auth import get_current_user
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.ml_service import ml_service

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict_loan_approval(
    request: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a loan application to the Random Forest model.
    Runs data cleaning, feature engineering, prediction, and explainability.
    Saves the application details and prediction outputs to the database.
    """
    raw_data = request.model_dump()
    
    # Run prediction pipeline (cleans, engineer features, predicts, explains)
    result = ml_service.predict(raw_data)
    
    # Save application details to PostgreSQL database
    db_application = LoanApplication(
        user_id=current_user.id,
        no_of_dependents=request.no_of_dependents,
        education=request.education,
        self_employed=request.self_employed,
        income_annum=request.income_annum,
        loan_amount=request.loan_amount,
        loan_term=request.loan_term,
        cibil_score=request.cibil_score,
        
        # Real-world additional fields
        credit_utilization_ratio=request.credit_utilization_ratio,
        previous_defaults=request.previous_defaults,
        monthly_emi=request.monthly_emi,
        
        residential_assets_value=request.residential_assets_value,
        commercial_assets_value=request.commercial_assets_value,
        luxury_assets_value=request.luxury_assets_value,
        bank_asset_value=request.bank_asset_value,
        
        # Model predictions
        prediction_result=result["prediction_result"],
        approval_probability=result["approval_probability"],
        explanation_data=result["explanation"]  # List of dicts saved as JSON
    )
    
    db.add(db_application)
    await db.commit()
    await db.refresh(db_application)
    
    # Return formatted response
    return PredictionResponse(
        prediction_result=result["prediction_result"],
        loan_status=result["loan_status"],
        approval_probability=result["approval_probability"],
        explanation=result["explanation"],
        decision_message=result["decision_message"]
    )
