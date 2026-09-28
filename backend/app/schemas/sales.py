from pydantic import BaseModel
from typing import List, Optional


class CategorySales(BaseModel):
    category: str
    total_sales: float
    transactions: int


class RegionSales(BaseModel):
    region: str
    total_sales: float
    transactions: int


class OutletSales(BaseModel):
    outlet_type: str
    total_sales: float
    transactions: int


class MonthlySales(BaseModel):
    month: str
    total_sales: float


class SalesOverviewResponse(BaseModel):
    by_category: List[CategorySales]
    by_region: List[RegionSales]
    by_outlet: List[OutletSales]
    monthly_trend: List[MonthlySales]
    monthly_trend_note: Optional[str] = None