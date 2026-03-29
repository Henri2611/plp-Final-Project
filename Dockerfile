# ============================================
# Stage 1: Build React Frontend
# ============================================
# Using debian-slim instead of alpine to avoid musl/glibc issues with rollup
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Copy all frontend files
COPY frontend/ ./

# Build arguments for API URL (defaults to relative path for same-origin)
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Workaround for npm optional dependencies bug
# Delete package-lock.json and node_modules, then clean install
RUN rm -f package-lock.json && \
    rm -rf node_modules && \
    npm install --legacy-peer-deps

# Fix execute permissions on bin files (critical for npm run build)
RUN chmod +x node_modules/.bin/*

# Build
RUN npm run build


# ============================================
# Stage 2: Python Backend + Serve Frontend
# ============================================
FROM python:3.11-slim

WORKDIR /app

# Install minimal dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend bundle
COPY --from=frontend-builder /app/frontend/dist ./static

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')"

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
