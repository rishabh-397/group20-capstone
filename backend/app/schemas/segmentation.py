from pydantic import BaseModel
from typing import List


class Cluster(BaseModel):
    cluster_id: int
    label: str
    size: int
    avg_sales: float
    avg_discount_pct: float
    avg_profit_margin_pct: float


class SegmentationResponse(BaseModel):
    clusters: List[Cluster]
    method: str
    silhouette_score: float
    note: str