import json
from pathlib import Path
from fastapi import APIRouter
from sqlalchemy import text

from app.schemas.discount_margin import DiscountMarginResponse
from app.core.config import settings
from app.core.database import engine

router = APIRouter(prefix="/sales", tags=["Sales"])

MOCK_FILE = Path(__file__).resolve().parent.parent / "mock_data" / "discount_margin.json"

DISCOUNT_MARGIN_QUERY = text("""
    SELECT
        CASE
            WHEN discount < 0.10 THEN '0-10%'
            WHEN discount < 0.20 THEN '10-20%'
            WHEN discount < 0.30 THEN '20-30%'
            WHEN discount < 0.40 THEN '30-40%'
            WHEN discount < 0.50 THEN '40-50%'
            ELSE '50%+'
        END AS discount_tier,
        ROUND(AVG(profit / NULLIF(sales,0)) * 100, 2) AS avg_margin_pct,
        ROUND(AVG(sales), 2) AS avg_order_value,
        COUNT(*) AS orders
    FROM fact_sales
    GROUP BY 1
    ORDER BY 1
""")

NOTE = (
    "The strongest real signal in this dataset: profit margin falls steadily as discount "
    "depth increases. Category, region, and outlet totals are evenly distributed and do not "
    "show comparable variation (confirmed via ANOVA by Kalpaang)."
)


@router.get("/discount-margin", response_model=DiscountMarginResponse,
            summary="Profit margin by discount tier — the dataset's strongest real signal")
def get_discount_margin():
    if settings.USE_MOCK_DATA:
        with open(MOCK_FILE) as f:
            return json.load(f)

    with engine.connect() as conn:
        rows = [dict(r._mapping) for r in conn.execute(DISCOUNT_MARGIN_QUERY)]

    return {"rows": rows, "note": NOTE}