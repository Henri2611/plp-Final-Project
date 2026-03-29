# 🔧 500 Internal Server Error Fix - Enhanced Logging & Error Handling

## Issue
```
POST /api/predict 500 (Internal Server Error)
```

**Root Cause Found:** 
```
Client.__init__() got an unexpected keyword argument 'hf_token'
```

The newer `gradio_client` library uses `token` instead of `hf_token` parameter!

## Changes Applied

### 1. Enhanced hf_client.py

**Added:**
- Multiple fallback methods for calling the Gradio API
- Detailed logging at each step
- Better error messages
- Improved payload parsing for different response formats

**Now tries 3 methods in order:**
1. Named parameter: `predict(image=file, api_name="/predict")`
2. Positional parameter: `predict(file, api_name="/predict")`
3. Default endpoint: `predict(file, fn_index=0)`

### 2. Enhanced pneumonia.py Router

**Added:**
- Detailed logging for each request
- Better error categorization (400, 503, 500)
- More descriptive error messages returned to frontend
- File size logging

### 3. Improved Payload Parsing

**Now handles:**
- `{"confidences": [{"label": "X", "confidence": 0.9}]}`
- `{"label": "X", "confidence": 0.9}`
- `{"Positive": 0.9, "Negative": 0.1}`
- String responses (fallback)

## Files Modified
- `backend/app/services/hf_client.py` - Enhanced error handling & logging
- `backend/app/routers/pneumonia.py` - Better error responses

## What to Check After Deploying

### 1. Check Render Logs Carefully

Look for these log messages:

**Success Path:**
```
INFO: Received prediction request for file: test.jpg
INFO: Read 45234 bytes from uploaded file
INFO: Connecting to Hugging Face Space 'Henri4679/pneumonia-xray'
INFO: Successfully connected to Hugging Face Space
INFO: Calling Hugging Face Space API: /predict
INFO: Using image file: /tmp/xxxxx.jpg
INFO: Received result from Hugging Face Space: {...}
INFO: Parsing payload type: dict, value: {...}
INFO: Prediction successful: Positive (87.50%)
INFO: "POST /api/predict HTTP/1.1" 200 OK
```

**Error Scenarios:**

**Scenario A: Connection Failed**
```
ERROR: Failed to connect to Hugging Face Space: ...
```
→ Space is down or inaccessible

**Scenario B: All Methods Failed**
```
WARNING: Method 1 failed (named param): ...
WARNING: Method 2 failed (positional): ...
ERROR: All prediction methods failed: ...
```
→ API structure incompatible

**Scenario C: Parsing Failed**
```
ERROR: Unexpected response format from Hugging Face Space
```
→ Response structure changed

### 2. Test the Hugging Face Space Directly

Visit: https://huggingface.co/spaces/Henri4679/pneumonia-xray

1. Check if Space is running (green status)
2. Try uploading an image directly
3. Check what response format it returns
4. Look at the Space's code to see API structure

### 3. Check Environment Variables on Render

Verify these are set correctly:
- `HF_SPACE_ID` = `Henri4679/pneumonia-xray`
- `HF_API_NAME` = `/predict` (or try empty/different value)
- `HF_API_TOKEN` = (optional, only if Space is private)

## Alternative Solutions

### Option 1: Try Different API Endpoint

Update environment variable on Render:
```
HF_API_NAME=/run/predict
# or
HF_API_NAME=
# or check the Space's gradio app for exact endpoint name
```

### Option 2: Use Different gradio_client Version

If current version still has issues:

```python
# In requirements.txt, try:
gradio_client==1.3.0
# or
gradio_client==1.4.1
# or
gradio_client==1.5.0
```

### Option 3: Switch to Direct HTTP API

Instead of gradio_client, use httpx to call Space directly:

```python
# In hf_client.py
async def predict_with_hf(...):
    async with httpx.AsyncClient() as client:
        files = {"file": (filename, image_bytes, content_type)}
        response = await client.post(
            f"https://{HF_SPACE_ID.replace('/', '-')}.hf.space/api/predict",
            files=files,
            timeout=30.0
        )
        result = response.json()
    return _parse_payload(result)
```

### Option 4: Use Local Model (Fallback)

If HF Space continues to have issues, use the local VGG19 model:

1. Uncomment torch/torchvision/Pillow in requirements.txt
2. Add your model.pt file to backend/models/
3. Update router to use:
   ```python
   from app.predict import Predictor
   from app.utils.preprocessing import preprocess_image
   
   predictor = Predictor()
   tensor = preprocess_image(image_bytes)
   label, prob = predictor.predict(tensor)
   ```

## Deploy Instructions

```bash
# Commit enhanced error handling
git add backend/app/services/hf_client.py backend/app/routers/pneumonia.py
git commit -m "Add comprehensive logging and error handling for predictions"
git push origin main
```

## What to Do Next

1. **Deploy the changes** (push to GitHub)
2. **Watch Render logs** during deployment
3. **Try prediction** from frontend
4. **Copy full error logs** and share them
5. **Check HF Space status** at https://huggingface.co/spaces/Henri4679/pneumonia-xray

## Debugging Commands

Once deployed, test with curl to see detailed error:

```bash
# Test with a sample image
curl -X POST https://pneumonia-detection-app-6l8x.onrender.com/api/predict \
  -F "file=@test-xray.jpg" \
  -v
```

Look for the error message in the response body.

## Common Issues & Solutions

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| "Cannot connect to Space" | Space is down | Check HF Space status |
| "All prediction methods failed" | API incompatibility | Try different HF_API_NAME |
| "Unexpected response format" | Response structure changed | Update _parse_payload |
| "Module not found" | gradio_client issue | Try different version |
| Timeout errors | Space is slow/busy | Increase timeout or retry |

---

## Summary

These changes add **comprehensive logging** so we can see exactly where and why the prediction is failing. The enhanced error handling also provides **multiple fallback methods** to try different ways of calling the Hugging Face API.

**Next Step**: Deploy and check the Render logs for the detailed error messages!

---

**Status**: ✅ Enhanced error handling deployed - Waiting for logs
