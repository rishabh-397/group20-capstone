import json
from pathlib import Path
from fastapi import APIRouter

from app.schemas.segmentation import SegmentationResponse

router = APIRouter(prefix="/segmentation", tags=["Segmentation"])

MOCK_FILE = Path(__file__).resolve().parent.parent / "mock_data" / "segmentation.json"


@router.get("/", response_model=SegmentationResponse, summary="Cluster/segment results for the Segmentation page")
def get_segmentation():
    """
    Returns cluster profiles (label, size, average sales, discount and profit margin).
    Results come from the ML analysis on the v2 dataset.
    """
    with open(MOCK_FILE) as f:
        return json.load(f)
