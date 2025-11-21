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
    """
    Parse various response formats from Gradio Spaces.
    Handles: dict with confidences, dict with label/confidence, dict with class probs, string, list
    """
    logger.info("Parsing payload type: %s, value: %s", type(payload).__name__, payload)
    
    # If it's a list, take the first element
    if isinstance(payload, list) and payload:
        payload = payload[0]

    # If it's a dict (most common for classification)
    if isinstance(payload, dict):
        # Format 1: {"confidences": [{"label": "Positive", "confidence": 0.9}, ...]}
        confidences = payload.get("confidences")
        if isinstance(confidences, list) and confidences:
            best = max(confidences, key=lambda item: item.get("confidence", 0))
            return best.get("label", "Unknown"), float(best.get("confidence", 0))
        
        # Format 2: {"label": "Positive", "confidence": 0.9}
        if "label" in payload and "confidence" in payload:
            return payload["label"], float(payload["confidence"])
        
        # Format 3: {"Positive": 0.9, "Negative": 0.1}
        if payload:
            label, prob = max(
                payload.items(), 
                key=lambda kv: float(kv[1]) if isinstance(kv[1], (int, float)) else 0,
                default=("Unknown", 0)
            )
            return label, float(prob)
    
    # If it's a string (e.g., just the label)
    if isinstance(payload, str):
        logger.warning("Received string response: %s, returning with 0.5 confidence", payload)
        return payload, 0.5
    
    # If we get here, format is unexpected
    raise ValueError(
        f"Unexpected response format from Hugging Face Space. "
        f"Type: {type(payload)}, Value: {payload}. "
        f"Expected dict with 'label'/'confidence' or 'confidences' list."
    )


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
            logger.info("Using image file: %s", tmp_name)
            
            # Try calling the prediction - the exact method depends on the Space's API
            try:
                # Method 1: Named parameter
                result = client.predict(
                    image=gradio_file(tmp_name),
                    api_name=HF_API_NAME,
                )
            except Exception as e1:
                logger.warning("Method 1 failed (named param): %s, trying method 2...", str(e1))
                try:
                    # Method 2: Positional parameter
                    result = client.predict(
                        gradio_file(tmp_name),
                        api_name=HF_API_NAME,
                    )
                except Exception as e2:
                    logger.warning("Method 2 failed (positional): %s, trying method 3...", str(e2))
                    # Method 3: Default endpoint (fn_index=0)
                    result = client.predict(
                        gradio_file(tmp_name),
                        fn_index=0,
                    )
            
            logger.info("Received result from Hugging Face Space: %s", result)
        except Exception as e:
            logger.error("All prediction methods failed: %s", str(e), exc_info=True)
            raise RuntimeError(
                f"Prediction failed on Hugging Face Space '{HF_SPACE_ID}'. "
                f"The Space might be down or has an incompatible API. Error: {str(e)}"
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

