from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import select, and_

from app.models.application import LoanApplication
from app.schemas.application import AnalyticsResponse, CibilBucketStats


class AnalyticsService:
    async def get_analytics(self, db: AsyncSession, user_id: Optional[int] = None) -> AnalyticsResponse:
        """
        Aggregate loan application statistics.
        If user_id is provided, aggregates only that user's records;
        otherwise, aggregates all records (global analytics).
        """
        # Fetch applications
        query = select(LoanApplication)
        if user_id is not None:
            query = query.where(LoanApplication.user_id == user_id)
            
        result = await db.execute(query)
        apps = result.scalars().all()
        
        total = len(apps)
        if total == 0:
            return AnalyticsResponse(
                total_applications=0,
                approved_applications=0,
                rejected_applications=0,
                approval_rate=0.0,
                average_loan_amount=0.0,
                average_income=0.0,
                average_cibil_score=0.0,
                cibil_stats=[],
                loan_term_distribution={},
                approval_by_education={"graduate": 0.0, "not graduate": 0.0},
                approval_by_employment={"yes": 0.0, "no": 0.0},
                monthly_trends=[]
            )
            
        approved_apps = [a for a in apps if a.prediction_result == 1]
        rejected_apps = [a for a in apps if a.prediction_result == 0]
        
        approved_count = len(approved_apps)
        rejected_count = len(rejected_apps)
        approval_rate = approved_count / total
        
        avg_loan = sum(a.loan_amount for a in apps) / total
        avg_income = sum(a.income_annum for a in apps) / total
        avg_cibil = sum(a.cibil_score for a in apps) / total
        
        # CIBIL bucket stats
        # Poor (300-549), Fair (550-649), Good (650-749), Excellent (750-900)
        buckets = [
            {"name": "Poor (300-549)", "min": 300, "max": 549},
            {"name": "Fair (550-649)", "min": 550, "max": 649},
            {"name": "Good (650-749)", "min": 650, "max": 749},
            {"name": "Excellent (750-900)", "min": 750, "max": 900}
        ]
        
        cibil_stats_list = []
        for b in buckets:
            b_apps = [a for a in apps if b["min"] <= a.cibil_score <= b["max"]]
            b_total = len(b_apps)
            b_approved = sum(1 for a in b_apps if a.prediction_result == 1)
            b_rejected = b_total - b_approved
            b_rate = b_approved / b_total if b_total > 0 else 0.0
            
            cibil_stats_list.append(
                CibilBucketStats(
                    bucket=b["name"],
                    total=b_total,
                    approved=b_approved,
                    rejected=b_rejected,
                    approval_rate=b_rate
                )
            )
            
        # Loan term distribution
        term_dist = {}
        for a in apps:
            term_str = str(a.loan_term)
            term_dist[term_str] = term_dist.get(term_str, 0) + 1
            
        # Approval rates by category
        def calc_approval_rate_by_filter(filter_fn):
            filtered = [a for a in apps if filter_fn(a)]
            if not filtered:
                return 0.0
            return sum(1 for a in filtered if a.prediction_result == 1) / len(filtered)
            
        edu_stats = {
            "graduate": calc_approval_rate_by_filter(lambda a: a.education.lower() == "graduate"),
            "not graduate": calc_approval_rate_by_filter(lambda a: a.education.lower() == "not graduate")
        }
        
        emp_stats = {
            "yes": calc_approval_rate_by_filter(lambda a: a.self_employed.lower() == "yes"),
            "no": calc_approval_rate_by_filter(lambda a: a.self_employed.lower() == "no")
        }
        
        # Monthly trends (grouping by last 6 months including current month)
        monthly_data: Dict[str, Dict[str, Any]] = {}
        
        # Prepare months list
        now = datetime.utcnow()
        for i in range(5, -1, -1):
            # approximate dates
            target_date = now - timedelta(days=30 * i)
            month_key = target_date.strftime("%Y-%m")
            month_name = target_date.strftime("%b")
            monthly_data[month_key] = {"month": month_name, "total": 0, "approved": 0, "rejected": 0}
            
        for a in apps:
            m_key = a.created_at.strftime("%Y-%m")
            if m_key in monthly_data:
                monthly_data[m_key]["total"] += 1
                if a.prediction_result == 1:
                    monthly_data[m_key]["approved"] += 1
                else:
                    monthly_data[m_key]["rejected"] += 1
                    
        # If there are old applications, handle them by adding them to the first bucket
        # Or sort the keys
        trends = list(monthly_data.values())
        
        return AnalyticsResponse(
            total_applications=total,
            approved_applications=approved_count,
            rejected_applications=rejected_count,
            approval_rate=approval_rate,
            average_loan_amount=round(avg_loan, 2),
            average_income=round(avg_income, 2),
            average_cibil_score=round(avg_cibil, 2),
            cibil_stats=cibil_stats_list,
            loan_term_distribution=term_dist,
            approval_by_education=edu_stats,
            approval_by_employment=emp_stats,
            monthly_trends=trends
        )


analytics_service = AnalyticsService()
