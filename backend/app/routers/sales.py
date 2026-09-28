import json
from pathlib import Path
from fastapi import APIRouter, Query
from sqlalchemy import text
from typing import Optional

from app.schemas.sales import SalesOverviewResponse
from app.core.config import settings
from app.core.database import engine

router = APIRouter(prefix="/sales", tags=["Sales"])

MOCK_FILE = Path(__file__).resolve().parent.parent / "mock_data" / "sales.json"

BY_CATEGORY_QUERY = text("""
    SELECT p.category, SUM(f.sales) AS total_sales, COUNT(*) AS transactions
    FROM fact_sales f JOIN dim_products p ON p.product_id = f.product_id
    GROUP BY p.category ORDER BY total_sales DESC
""")

BY_REGION_QUERY = text("""
    SELECT s.region, SUM(f.sales) AS total_sales, COUNT(*) AS transactions
    FROM fact_sales f JOIN dim_store s ON s.store_id = f.store_id
    GROUP BY s.region ORDER BY total_sales DESC
""")

BY_OUTLET_QUERY = text("""
    SELECT s.outlet_type, SUM(f.sales) AS total_sales, COUNT(*) AS transactions
    FROM fact_sales f JOIN dim_store s ON s.store_id = f.store_id
    GROUP BY s.outlet_type ORDER BY total_sales DESC
""")

MONTHLY_TREND_QUERY = text("""
    SELECT to_char(date_trunc('month', sales_date), 'YYYY-MM') AS month,
           SUM(sales) AS total_sales
    FROM fact_sales
    WHERE date_trunc('month', sales_date) < date_trunc('month', DATE '2024-01-01')
    GROUP BY 1
    ORDER BY 1
""")


@router.get("/overview", response_model=SalesOverviewResponse, summary="Sales by category/region/outlet + monthly trend")
def get_sales_overview(
    region: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    outlet_type: Optional[str] = Query(None),
):
    if settings.USE_MOCK_DATA:
        with open(MOCK_FILE) as f:
            return json.load(f)

    with engine.connect() as conn:
        by_category = [dict(r._mapping) for r in conn.execute(BY_CATEGORY_QUERY)]
        by_region = [dict(r._mapping) for r in conn.execute(BY_REGION_QUERY)]
        by_outlet = [dict(r._mapping) for r in conn.execute(BY_OUTLET_QUERY)]
        monthly_trend = [dict(r._mapping) for r in conn.execute(MONTHLY_TREND_QUERY)]

    return {
        "by_category": by_category,
        "by_region": by_region,
        "by_outlet": by_outlet,
        "monthly_trend": monthly_trend,
        "monthly_trend_note": (
            "Populated with real data (v2). The Sales Date artifact from v1 is fixed "
            "(Order Date + random 3-7 day offset) - monthly totals fluctuate with only "
            "~11.5% coefficient of variation and near-zero lag-1 autocorrelation, confirming "
            "genuinely stable, trend-free revenue with mild real calendar-month seasonality "
            "(February consistently lowest). Confirmed by Kalpaang's v2 EDA report. The partial "
            "trailing month (Jan 2024) is excluded as a known offset spillover, not real data."
        ),
    }