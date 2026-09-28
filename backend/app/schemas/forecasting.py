from pydantic import BaseModel
from typing import List, Optional


class ForecastMetrics(BaseModel):
    mae: float
    mse: float
    rmse: float
    r2_score: float


class AlternateModel(BaseModel):
    model: str
    mae: float
    rmse: float
    r2_score: float


class ActualVsPredicted(BaseModel):
    month: str
    actual: float
    predicted: float


class ForecastPoint(BaseModel):
    month: str
    predicted: float


class ForecastingResponse(BaseModel):
    model: str
    metrics: ForecastMetrics
    alternate_model: Optional[AlternateModel] = None
    historical_vs_predicted: List[ActualVsPredicted]
    forecast_next_3_months: List[ForecastPoint]
    forecast_note: Optional[str] = None
    note: Optional[str] = None