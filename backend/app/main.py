from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routers import kpis, sales, segmentation, forecasting, discount_margin

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Backend API for the Business Sales Forecasting & Customer Segmentation capstone. "
        "KPI, sales and discount-margin endpoints query PostgreSQL; "
        "segmentation and forecasting endpoints serve the saved results of the machine learning analysis."
    ),
    version="0.1.0",
)

# Allow the React frontend (localhost:5173 in dev) to call these APIs.
# Update allow_origins with the real deployed frontend URL before final submission.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Basic error handling so the frontend always gets a clean JSON error, not a raw stack trace."""
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


@app.get("/", tags=["Health"])
def health_check():
    """Quick check that the API is running and whether mock mode is on."""
    return {"status": "ok", "message": "Capstone backend is running", "mock_mode": settings.USE_MOCK_DATA}


# Register all route groups under /api/v1
app.include_router(kpis.router, prefix=settings.API_V1_PREFIX)
app.include_router(sales.router, prefix=settings.API_V1_PREFIX)
app.include_router(segmentation.router, prefix=settings.API_V1_PREFIX)
app.include_router(forecasting.router, prefix=settings.API_V1_PREFIX)
app.include_router(discount_margin.router, prefix=settings.API_V1_PREFIX)

# Alias: frontend calls /api/v1/forecast/ (singular) and expects keys named
# "history" and "forecast" (not historical_vs_predicted/forecast_next_3_months).
# Transform the real response's shape rather than duplicating the endpoint logic.
@app.get("/api/v1/forecast/", tags=["Forecasting"])
def get_forecast_alias():
    real = forecasting.get_forecasting()
    return {
        **real,
        "history": real["historical_vs_predicted"],
        "forecast": real["forecast_next_3_months"],
    }
