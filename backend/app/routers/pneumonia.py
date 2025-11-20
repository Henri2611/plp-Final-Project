import logging
import time

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.predict import Predictor
from app.schemas.predict_schema import PredictionResponse
from app.utils.preprocessing import preprocess_image

router = APIRouter(prefix="/predict", tags=["Pneumonia"])
logger = logging.getLogger(__name__)

# Create one predictor per process; internally it caches the PyTorch model.
predictor = Predictor()


@router.post(
    "",
    response_model=PredictionResponse,
    summary="Predict pneumonia from a chest X-ray",
)
async def predict(file: UploadFile = File(...)) -> PredictionResponse:
    """Accepts an uploaded X-ray image and returns the predicted label + probability."""
    start = time.perf_counter()
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image uploads are supported.",
        )

    try:
        image_bytes = await file.read()
        tensor = preprocess_image(image_bytes)
        preprocess_time = time.perf_counter()
        label, probability = predictor.predict(tensor)
        inference_time = time.perf_counter()

        logger.debug(
            "Prediction completed in %.3fs (prep=%.3fs, infer=%.3fs)",
            inference_time - start,
            preprocess_time - start,
            inference_time - preprocess_time,
        )
        return PredictionResponse(prediction=label, probability=probability)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except Exception as exc:  # pragma: no cover - general safety net
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to run prediction. Check server logs for details.",
        ) from exc

