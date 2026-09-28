import json
from pathlib import Path
from fastapi import APIRouter
from sqlalchemy import text

from app.schemas.kpis import KPIResponse
from app.core.config import settings
from app.core.database import engine

router = APIRouter(prefix="/kpis", tags=["KPIs"])

MOCK_FILE = Path(__file__).resolve().parent.parent / "mock_data" / "kpis.json"

KPI_QUERY = text("""
    SELECT
        COUNT(*) AS total_transactions,
        SUM(sales) AS total_sales,
        SUM(profit) AS total_profit,
        ROUND(SUM(sales) * 1.0 / COUNT(*), 2) AS average_order_value
    FROM fact_sales
""")

TOP_CATEGORY_QUERY = text("""
    SELECT p.category, SUM(f.sales) AS revenue
    FROM fact_sales f JOIN dim_products p ON p.product_id = f.product_id
    GROUP BY p.category ORDER BY revenue DESC LIMIT 1
""")

TOP_REGION_QUERY = text("""
    SELECT s.region, SUM(f.sales) AS revenue
    FROM fact_sales f JOIN dim_store s ON s.store_id = f.store_id
    GROUP BY s.region ORDER BY revenue DESC LIMIT 1
""")


@router.get("/", response_model=KPIResponse, summary="Overall business KPIs for the Main Dashboard")
def get_kpis():
    if settings.USE_MOCK_DATA:
        with open(MOCK_FILE) as f:
            return json.load(f)

    with engine.connect() as conn:
        kpi_row = conn.execute(KPI_QUERY).mappings().one()
        top_category = conn.execute(TOP_CATEGORY_QUERY).mappings().first()
        top_region = conn.execute(TOP_REGION_QUERY).mappings().first()

    return {
        "total_sales": float(kpi_row["total_sales"]),
        "total_transactions": int(kpi_row["total_transactions"]),
        "total_profit": float(kpi_row["total_profit"]),
        "average_order_value": float(kpi_row["average_order_value"]),
        "top_category": top_category["category"] if top_category else "N/A",
        "top_region": top_region["region"] if top_region else "N/A",
        "last_updated": "live",
    }