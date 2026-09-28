from pydantic import BaseModel


class KPIResponse(BaseModel):
    total_sales: float
    total_transactions: int
    total_profit: float
    average_order_value: float
    top_category: str
    top_region: str
    last_updated: str