# Multi-stage Dockerfile for full-stack app (Frontend + Backend)

# ============================================
# Stage 1: Build React Frontend
# ============================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build arguments for API URL (defaults to relative path for same-origin)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build production bundle
RUN npm run build

# ============================================
# Stage 2: Python Backend + Serve Frontend
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./static

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')"

# Run FastAPI with uvicorn (PORT env var support for Render)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

