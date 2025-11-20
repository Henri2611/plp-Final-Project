from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    """
    API contract for the /predict endpoint.
    Keeping schemas centralized allows the frontend to rely on a stable shape.
    """

    prediction: str = Field(..., examples=["Positive", "Negative"])
    probability: float = Field(..., ge=0, le=1, example=0.91)

