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
        logger.info("Received prediction request for file: %s", file.filename)
        image_bytes = await file.read()
        logger.info("Read %d bytes from uploaded file", len(image_bytes))
        
        label, probability = await predict_with_hf(
            image_bytes=image_bytes,
            filename=file.filename,
            content_type=file.content_type,
        )
        logger.info("Prediction successful: %s (%.2f%%)", label, probability * 100)
        return PredictionResponse(prediction=label, probability=probability)
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except RuntimeError as exc:
        # RuntimeError from hf_client with descriptive message
        logger.error("Prediction failed with RuntimeError: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        # Catch-all for unexpected errors
        logger.exception("Unexpected error during prediction")
        error_msg = f"Prediction failed: {type(exc).__name__}: {str(exc)}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg,
        ) from exc

