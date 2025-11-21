# Pneumonia Detection API

FastAPI proxy that forwards image uploads to a Hugging Face Gradio Space and
returns the AI verdict to the React dashboard.

## Project layout

```
backend/
├─ app/
│  ├─ main.py                  # FastAPI factory + CORS + router wiring
│  ├─ routers/pneumonia.py     # /api/predict endpoint
│  ├─ services/hf_client.py    # Hugging Face Space client
│  └─ schemas/predict_schema.py
├─ requirements.txt
└─ README.md
```

## Environment variables

| Variable         | Default                         | Description                                   |
| ---------------- | ------------------------------- | --------------------------------------------- |
| `HF_SPACE_ID`    | `Henri4679/pneumonia-xray`      | Hugging Face Space identifier                 |
| `HF_API_NAME`    | `/predict`                      | Gradio API name exposed by the Space          |
| `HF_API_TOKEN`   | *(empty)*                       | Optional HF token for private Spaces          |
| `UVICORN_PORT`   | `8000` (set via CLI)            | Port when running locally/hosting             |

Set these in `.env` or your hosting provider’s dashboard.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Optional: export HF creds
set HF_SPACE_ID=Henri4679/pneumonia-xray
set HF_API_TOKEN=hf_xxx
```

## Run locally

```bash
uvicorn app.main:app --reload --port 8000
```

API lives at `http://localhost:8000`, docs at `http://localhost:8000/docs`.

## Prediction flow

1. React uploads an X-ray to `POST /api/predict`.
2. FastAPI streams the bytes to the configured Hugging Face Space using
   `gradio_client`.
3. The Space returns the probability distribution; the proxy normalizes it to:

```json
{
  "prediction": "Positive",
  "probability": 0.87
}
```

You can swap the Space ID/API name without touching the frontend. If you later
host multiple models, add more routers that call different Spaces.

