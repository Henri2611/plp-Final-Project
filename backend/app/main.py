from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.pneumonia import router as pneumonia_router


def create_app() -> FastAPI:
    """
    Factory that creates and configures the FastAPI application.
    Having a factory makes it easier to test and to plug extra
    middleware or routers later when new ML models are added.
    """
    app = FastAPI(
        title="Pneumonia Detection API",
        description="Predict pneumonia from chest X-ray images using a PyTorch model.",
        version="1.0.0",
    )

    # Allow the React frontend (and future apps) to call this API.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production replace with the actual frontend origin.
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers keep the main file clean and ready for more endpoints.
    app.include_router(pneumonia_router, prefix="/api")

    @app.get("/", tags=["Root"])
    async def root() -> dict[str, str]:
        """Root endpoint with API information."""
        return {
            "message": "Pneumonia Detection API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/health",
            "predict": "/api/predict",
        }

    @app.get("/health", tags=["Health"])
    async def health_check() -> dict[str, str]:
        """Lightweight health probe used by monitors or container platforms."""
        return {"status": "ok"}

    return app


app = create_app()

