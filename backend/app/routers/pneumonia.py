import logging

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.schemas.predict_schema import PredictionResponse
from app.services.hf_client import predict_with_hf

router = APIRouter(tags=["Pneumonia"])
logger = logging.getLogger(__name__)


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict pneumonia from a chest X-ray",
)
async def predict(file: UploadFile = File(...)) -> PredictionResponse:
    """Accepts an uploaded X-ray image and proxies the request to the Hugging Face Space."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image uploads are supported.",
        )

    try:
        image_bytes = await file.read()
        label, probability = await predict_with_hf(
            image_bytes=image_bytes,
            filename=file.filename,
            content_type=file.content_type,
        )
        return PredictionResponse(prediction=label, probability=probability)
    except Exception as exc:  # pragma: no cover - general safety net
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to run prediction. Check server logs for details.",
        ) from exc

