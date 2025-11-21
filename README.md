# Pneumonia X-ray Detection Web App

End-to-end doctor-facing dashboard powered by:

- **Frontend:** React + Vite + Tailwind (`frontend/`)
- **Backend:** FastAPI proxy (`backend/`)
- **Model Hosting:** Hugging Face Gradio Space (`Henri4679/pneumonia-xray`)

The React app uploads chest X-rays to the FastAPI backend, which forwards them to
the hosted Gradio Space and returns the AI prediction (Positive/Negative +
probability).

---

## Project layout

```
.
├─ backend/
│  ├─ app/main.py                  # FastAPI factory + CORS
│  ├─ app/routers/pneumonia.py     # /api/predict proxy endpoint
│  ├─ app/services/hf_client.py    # Gradio client wrapper
│  └─ requirements.txt             # FastAPI + gradio_client deps
├─ frontend/
│  ├─ src/components/...           # React doctor dashboard UI
│  ├─ src/pages/Dashboard.jsx
│  └─ package.json                 # Vite + Tailwind setup
└─ README.md (this file)
```

---

## Prerequisites

- Python 3.11+ (for FastAPI backend)
- Node.js 18+ (for Vite frontend)
- Hugging Face Space with your model (`HF_SPACE_ID`)
- Optional: Hugging Face API token (`HF_API_TOKEN`) if the Space is private

---

## Backend setup (FastAPI proxy)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# configure env vars (example)
set HF_SPACE_ID=Henri4679/pneumonia-xray
set HF_API_TOKEN=hf_your_token   # omit if Space is public

uvicorn app.main:app --reload --port 8000
```

`/api/predict` now accepts multipart image uploads and returns:

```json
{ "prediction": "Positive", "probability": 0.83 }
```

Environment variables (can be set in hosting provider):

| Variable       | Description                                 |
| -------------- | ------------------------------------------- |
| `HF_SPACE_ID`  | Hugging Face Space slug (`user/space-name`) |
| `HF_API_NAME`  | Gradio endpoint (`/predict` by default)     |
| `HF_API_TOKEN` | Hugging Face access token (optional)        |

---

## Frontend setup (React + Tailwind)

```bash
cd frontend
npm install

# For local dev (FastAPI on localhost:8000)
echo VITE_API_URL=http://localhost:8000/api > .env.local

npm run dev
```

Build for production:

```bash
npm run build
```

Deploy `frontend/dist` to your static host (Vercel, Netlify, Render, etc.) and
point `VITE_API_URL` to the hosted FastAPI base URL.

---

## Deployment outline

1. **Backend:** Deploy `backend/` to Render/Railway/Fly (or any container host).
   Provide `HF_SPACE_ID` and `HF_API_TOKEN` env vars. No heavy model file needed.
2. **Frontend:** Deploy `frontend/dist` to a static host. Set `VITE_API_URL` to
   the backend URL (e.g., `https://api.example.com/api`).
3. **Model:** Managed entirely by the Hugging Face Space you already created.

---

## Frontend–Backend interaction

- `UploadForm` sends the selected X-ray via `multipart/form-data` to
  `POST ${VITE_API_URL}/predict`.
- FastAPI streams the image to Hugging Face, waits for the response, then
  returns normalized JSON to the React dashboard.
- The dashboard updates the doctor view, history table, follow-up planner, and
  guideline reminders based on the response.

---

## Development tips

- To test with different Spaces, change `HF_SPACE_ID` and restart the backend.
- To work offline (without HF), you can temporarily point the backend to a local
  Torch model by swapping `predict_with_hf` for your `Predictor` class.
- For production, disable FastAPI reload (`uvicorn app.main:app --host 0.0.0.0 --port 8000`).

---

## License

MIT (adjust to your needs). Feel free to customize and extend—e.g., add patient
record storage, multi-model support, or authentication.
