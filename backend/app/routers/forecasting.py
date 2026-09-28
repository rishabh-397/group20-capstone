import json
from pathlib import Path
from fastapi import APIRouter

from app.schemas.forecasting import ForecastingResponse

router = APIRouter(prefix="/forecasting", tags=["Forecasting"])

MOCK_FILE = Path(__file__).resolve().parent.parent / "mock_data" / "forecasting.json"


@router.get("/", response_model=ForecastingResponse, summary="Historical vs predicted sales + forecast metrics")
def get_forecasting():
    """
    Returns the forecasting model name, MAE/MSE/RMSE/R2 metrics, actual-vs-predicted history,
    and the next 3 months' forecast.
    Used by: Shreetesh's Forecasting page.

    TODO (once Kalpaang delivers real outputs): replace mock read with Kalpaang's actual
    trained model results, stored by Mrinal in the database.
    """
    with open(MOCK_FILE) as f:
        return json.load(f)
