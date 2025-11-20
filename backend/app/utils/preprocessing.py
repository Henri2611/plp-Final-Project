"""
Image preprocessing helpers.
Keeping transformations decoupled from the router makes it trivial to plug in
different pipelines for other modalities or models.
"""

from __future__ import annotations

import io
from typing import Tuple

from PIL import Image
import torch
from torchvision import transforms

# Common means/stds for ImageNet-pretrained backbones. Adjust as needed.
IMAGE_SIZE: Tuple[int, int] = (224, 224)
MEAN = (0.485, 0.456, 0.406)
STD = (0.229, 0.224, 0.225)

_transform = transforms.Compose(
    [
        transforms.Resize(IMAGE_SIZE),
        transforms.CenterCrop(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ]
)


def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """
    Convert raw bytes into a normalized tensor ready for the PyTorch model.

    Returns:
        torch.Tensor with shape [1, 3, H, W]
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    tensor = _transform(image).unsqueeze(0)
    return tensor

