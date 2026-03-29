import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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
    # SECURITY NOTE: In production, replace "*" with specific allowed origins for better security
    # For Render deployment with same-origin serving, CORS is not strictly needed
    # Example: allow_origins=["https://your-app.onrender.com", "http://localhost:5173"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # TODO: Replace with specific origins in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health check endpoint (defined early, before catch-all routes)
    @app.get("/health", tags=["Health"])
    async def health_check() -> dict[str, str]:
        """Lightweight health probe used by monitors or container platforms."""
        return {"status": "ok"}

    # Routers keep the main file clean and ready for more endpoints.
    app.include_router(pneumonia_router, prefix="/api")

    # Serve static files (frontend build) if they exist
    static_dir = Path(__file__).parent.parent / "static"
    if static_dir.exists() and (static_dir / "index.html").exists():
        # Mount static assets (JS, CSS, images) from assets subdirectory
        assets_dir = static_dir / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
        
        # Serve index.html for root and all non-API routes (React Router)
        @app.get("/")
        async def serve_index():
            """Serve React app index.html."""
            return FileResponse(str(static_dir / "index.html"))
        
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            """
            Catch-all route to serve React app for client-side routing.
            This should NOT match /health, /api/*, /docs, etc. as they are defined earlier.
            """
            # Serve index.html for all routes (React Router handles client-side routing)
            index_path = static_dir / "index.html"
            if index_path.exists():
                return FileResponse(str(index_path))
            
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Frontend not found")
    else:
        # Fallback if static files don't exist (development mode)
        @app.get("/", tags=["Root"])
        async def root() -> dict[str, str]:
            """Root endpoint with API information."""
            return {
                "message": "Pneumonia Detection API",
                "version": "1.0.0",
                "docs": "/docs",
                "health": "/health",
                "predict": "/api/predict",
                "note": "Frontend not built. Run 'npm run build' in frontend/",
            }

    return app


app = create_app()

