# Deployment Checklist for Render

This checklist ensures your Pneumonia Detection app is ready for production deployment on Render.

## ✅ Pre-Deployment Checklist

### 1. Repository Setup
- [ ] All changes committed to Git
- [ ] `.gitignore` is properly configured (no node_modules, __pycache__, .env)
- [ ] Repository pushed to GitHub
- [ ] Branch is up to date with latest changes

### 2. Environment Variables
- [ ] `HF_SPACE_ID` configured (default: `Henri4679/pneumonia-xray`)
- [ ] `HF_API_NAME` configured (default: `/predict`)
- [ ] `HF_API_TOKEN` set in Render dashboard (if HF Space is private)
- [ ] Confirmed Hugging Face Space is accessible and working

### 3. Docker Configuration
- [ ] `Dockerfile` in root directory builds successfully locally
- [ ] Frontend builds without errors (`npm run build` in frontend/)
- [ ] Backend runs without errors (test locally with Docker)
- [ ] Health check endpoint (`/health`) responds correctly
- [ ] Port configuration uses `${PORT}` environment variable

### 4. Frontend Configuration
- [ ] `package-lock.json` exists (for reproducible builds)
- [ ] `VITE_API_URL` uses relative path `/api` (default in code)
- [ ] All frontend dependencies are in `package.json`
- [ ] Build outputs to `frontend/dist/`

### 5. Backend Configuration
- [ ] All Python dependencies in `requirements.txt`
- [ ] CORS settings appropriate (currently allows all origins)
- [ ] API routes work correctly (`/api/predict`, `/health`)
- [ ] File upload size limits configured (if needed)
- [ ] Gradio client connects to Hugging Face Space successfully

### 6. Security Review
- [ ] No hardcoded secrets or API keys in code
- [ ] Environment variables used for sensitive data
- [ ] CORS origins restricted (currently set to `*` - update for production)
- [ ] File upload validation in place
- [ ] HTTPS enforced (Render does this automatically)

### 7. Testing
- [ ] Local Docker build succeeds: `docker build -t pneumonia-app .`
- [ ] Local container runs: `docker run -p 8000:8000 -e HF_SPACE_ID=... pneumonia-app`
- [ ] Health check accessible: `curl http://localhost:8000/health`
- [ ] Frontend loads at `http://localhost:8000`
- [ ] Image upload and prediction works end-to-end
- [ ] API responds correctly: `curl http://localhost:8000/api/predict`

## 🚀 Render Deployment Steps

### Option 1: Blueprint (Recommended - Uses render.yaml)
1. Go to Render Dashboard → **New** → **Blueprint**
2. Connect your GitHub repository
3. Select the branch to deploy
4. Render auto-detects `render.yaml` and shows configuration
5. Set `HF_API_TOKEN` if your Hugging Face Space is private
6. Click **Apply** to deploy
7. Wait for build to complete (~5-10 minutes)
8. Visit the provided URL to test your app

### Option 2: Manual Web Service
1. Go to Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `pneumonia-detection-app`
   - **Environment**: Docker
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Context**: `.`
4. Add Environment Variables:
   - `HF_SPACE_ID` = `Henri4679/pneumonia-xray`
   - `HF_API_NAME` = `/predict`
   - `HF_API_TOKEN` = (your token if needed)
5. Set **Health Check Path**: `/health`
6. Click **Create Web Service**
7. Wait for build and deployment

## 🔍 Post-Deployment Verification

- [ ] App URL accessible and loads frontend
- [ ] `/health` endpoint returns `{"status": "ok"}`
- [ ] `/docs` shows FastAPI documentation
- [ ] Image upload works through UI
- [ ] Predictions return correctly
- [ ] No 500 errors in Render logs
- [ ] Response times acceptable (<30s for predictions)

## 🐛 Troubleshooting

### Build Fails
- Check Render logs for specific error
- Verify `Dockerfile` syntax
- Ensure all dependencies in requirements.txt
- Check that `package-lock.json` exists for frontend

### App Crashes
- Check Render logs: Dashboard → Logs tab
- Verify `HF_SPACE_ID` is correct
- Test Hugging Face Space directly
- Check memory limits (Free tier: 512 MB)

### Predictions Fail
- Verify `HF_API_TOKEN` is set correctly
- Check Hugging Face Space is running
- Review backend logs for error details
- Test Gradio client connection

### Frontend Not Loading
- Verify frontend built successfully in Docker logs
- Check `/` route returns HTML (not 404)
- Verify static files copied to `backend/static`

## 📊 Monitoring

After deployment, monitor:
- Response times in Render dashboard
- Error rates in logs
- Memory usage (upgrade plan if needed)
- Hugging Face Space status

## 🔄 Updates and Redeployment

To update your app:
1. Make changes locally
2. Test locally with Docker
3. Commit and push to GitHub
4. Render auto-deploys (if auto-deploy enabled)
5. Or manually trigger deploy in Render dashboard

## 📞 Support Resources

- Render Documentation: https://render.com/docs
- Render Support: https://render.com/support
- Hugging Face Docs: https://huggingface.co/docs
- FastAPI Docs: https://fastapi.tiangolo.com/

---

## Notes on Current Configuration

### Architecture
- **Single Container**: Frontend (React) + Backend (FastAPI) in one Docker image
- **Model Hosting**: External (Hugging Face Space) - no model files in container
- **Static Serving**: FastAPI serves built React app from `/static`
- **API Routing**: All `/api/*` routes handled by FastAPI

### Known Limitations
- Free tier: 512 MB RAM, may be slow for cold starts
- Prediction latency depends on Hugging Face Space
- CORS currently allows all origins (update for production)
- No database or persistent storage (history stored in browser only)

### Recommendations for Production
1. Upgrade to Starter plan for better performance
2. Add database for storing prediction history
3. Implement user authentication
4. Add rate limiting for API endpoints
5. Set up custom domain
6. Configure proper CORS origins
7. Add monitoring/alerting (e.g., Sentry)
8. Implement caching for faster responses
