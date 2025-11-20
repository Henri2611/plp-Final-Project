# Pneumonia Detection API

FastAPI service that wraps a PyTorch model to classify chest X-rays.

## Project layout

```
backend/
├─ app/
│  ├─ main.py              # FastAPI factory + CORS + router wiring
│  ├─ routers/pneumonia.py # /api/predict endpoint
│  ├─ predict.py           # Model loading + inference helpers
│  ├─ utils/preprocessing.py
│  └─ schemas/predict_schema.py
├─ requirements.txt
└─ README.md
```

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Place your TorchScript model at backend/models/pneumonia_model.pt
# or set MODEL_PATH to point to the file.
```

## Run locally

```bash
uvicorn app.main:app --reload
```

API will be available at `http://localhost:8000`. Interactive docs live at
`http://localhost:8000/docs`.

## Prediction flow

1. React frontend uploads an X-ray via `multipart/form-data`.
2. `preprocess_image` resizes, normalizes, and batches the tensor.
3. `Predictor` reuses the cached TorchScript model to avoid reloads.
4. Response returns:

```json
{
  "prediction": "Positive",
  "probability": 0.87
}
```

Adjust `predict.py` if you need a different label mapping or threshold. To
support new models, create an additional router + predictor module and include
it in `main.py`.

