import json
from pathlib import Path
from fastapi import APIRouter

from app.schemas.segmentation import SegmentationResponse

router = APIRouter(prefix="/segmentation", tags=["Segmentation"])

MOCK_FILE = Path(__file__).resolve().parent.parent / "mock_data" / "segmentation.json"


@router.get("/", response_model=SegmentationResponse, summary="Cluster/segment results for the Segmentation page")
def get_segmentation():
    """
    Returns cluster profiles (label, size, avg spend, dominant category/city type).
    Used by: Shreetesh's Customer/Segmentation page.

    TODO (once Kalpaang delivers real outputs): replace mock read with Kalpaang's actual
    K-Means cluster results, stored by Mrinal in the database.
    """
    with open(MOCK_FILE) as f:
        return json.load(f)
