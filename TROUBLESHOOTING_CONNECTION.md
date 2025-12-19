# Troubleshooting ERR_CONNECTION_RESET Errors

## Problem
Getting `ERR_CONNECTION_RESET` errors when frontend tries to connect to backend API.

## Quick Fixes

### 1. **Start the Backend Server**

The most common cause is that the backend API server is not running.

```bash
cd /Users/kilanimoemen/Desktop/PES
python3 main.py api
```

You should see:
```
🚀 Starting Solar Swarm Intelligence API
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. **Check if Server is Already Running**

```bash
# Check if port 8000 is in use
lsof -ti:8000

# If process is found, kill it and restart
kill $(lsof -ti:8000)
python3 main.py api
```

### 3. **Verify Server is Accessible**

Test the API directly:
```bash
curl http://localhost:8000/api/v1/simulation/status
```

Should return JSON, not connection error.

### 4. **Check for Import Errors**

If server crashes on startup:
```bash
python3 -c "from src.api.main import app; print('✅ OK')"
```

### 5. **Check Backend Logs**

Look for errors in terminal where server is running:
- Check for Python exceptions
- Check for import errors
- Check for syntax errors

### 6. **Frontend Configuration**

Make sure frontend is pointing to correct API URL:
- Check `frontend/src/api.js` - should use `http://localhost:8000`
- Or set environment variable: `VITE_API_URL=http://localhost:8000`

### 7. **CORS Issues**

If server is running but still getting errors, check CORS settings in `src/api/main.py`.

## Common Issues Fixed

### ✅ Added Error Handling to IoT Endpoints

The new IoT endpoints now have proper error handling to prevent crashes:
- Forecasting failures are caught and use fallback
- Anomaly detection failures are caught and logged
- Server won't crash if AI models fail to load

## Step-by-Step Debugging

1. **Start backend:**
   ```bash
   python3 main.py api
   ```

2. **In another terminal, test API:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **If that works, test endpoints:**
   ```bash
   curl http://localhost:8000/api/v1/simulation/status
   ```

4. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Check browser console** for errors

## Still Having Issues?

1. Check Python version (needs 3.10+)
2. Reinstall dependencies: `pip install -r requirements.txt`
3. Check firewall isn't blocking port 8000
4. Try different port: Set `API_PORT=8001` in environment

