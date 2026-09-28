from pydantic import BaseModel
from typing import List


class DiscountMarginRow(BaseModel):
    discount_tier: str
    avg_margin_pct: float
    avg_order_value: float
    orders: int


class DiscountMarginResponse(BaseModel):
    rows: List[DiscountMarginRow]
    note: str