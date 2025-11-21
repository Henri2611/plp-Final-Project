from __future__ import annotations

import asyncio
import logging
import os
import tempfile
from pathlib import Path
from typing import Tuple

from gradio_client import Client, file as gradio_file

logger = logging.getLogger(__name__)

HF_SPACE_ID = os.environ.get("HF_SPACE_ID", "Henri4679/pneumonia-xray")
HF_API_NAME = os.environ.get("HF_API_NAME", "/predict")
HF_TOKEN = os.environ.get("HF_API_TOKEN")

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        logger.info("Connecting to Hugging Face Space '%s'", HF_SPACE_ID)
        try:
            _client = Client(HF_SPACE_ID, hf_token=HF_TOKEN)
            logger.info("Successfully connected to Hugging Face Space")
        except Exception as e:
            logger.error("Failed to connect to Hugging Face Space: %s", str(e))
            raise RuntimeError(
                f"Cannot connect to Hugging Face Space '{HF_SPACE_ID}'. "
                f"Please check if the Space is running and accessible. Error: {str(e)}"
            ) from e
    return _client


def _parse_payload(payload) -> Tuple[str, float]:
    if isinstance(payload, list) and payload:
        payload = payload[0]

    if isinstance(payload, dict):
        confidences = payload.get("confidences")
        if isinstance(confidences, list) and confidences:
            best = max(confidences, key=lambda item: item.get("confidence", 0))
            return best.get("label", "Unknown"), float(best.get("confidence", 0))
        if "label" in payload and "confidence" in payload:
            return payload["label"], float(payload["confidence"])
        if payload:
            label, prob = max(
                payload.items(), key=lambda kv: float(kv[1] or 0), default=("Unknown", 0)
            )
            return label, float(prob)
    raise ValueError(f"Unexpected response from Hugging Face Space: {payload}")


async def predict_with_hf(
    image_bytes: bytes, filename: str | None, content_type: str | None
) -> Tuple[str, float]:
    """
    Upload the image to the Hugging Face Space and return (label, probability).
    """
    try:
        client = _get_client()
    except Exception as e:
        logger.error("Failed to get Hugging Face client: %s", str(e))
        raise
    
    suffix = Path(filename or "upload.png").suffix or ".png"

    def _call_hf() -> Tuple[str, float]:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(image_bytes)
            tmp.flush()
            tmp_name = tmp.name

        try:
            logger.info("Calling Hugging Face Space API: %s", HF_API_NAME)
            result = client.predict(
                api_name=HF_API_NAME,
                image=gradio_file(tmp_name),
            )
            logger.info("Received result from Hugging Face Space")
        except Exception as e:
            logger.error("Hugging Face prediction failed: %s", str(e))
            raise RuntimeError(
                f"Prediction failed on Hugging Face Space. Error: {str(e)}"
            ) from e
        finally:
            try:
                os.remove(tmp_name)
            except OSError:
                logger.warning("Failed to delete temp file %s", tmp_name)

        return _parse_payload(result)

    loop = asyncio.get_running_loop()
    label, probability = await loop.run_in_executor(None, _call_hf)
    return label, probability

