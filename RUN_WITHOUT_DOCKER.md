# 🚀 Running Without Docker (Recommended for Development)

Since Docker isn't running, here's how to run the application locally - it's actually simpler and faster for development!

## Quick Start (No Docker Needed)

### Step 1: Start Backend API

```bash
# Make sure you're in the project root
cd /Users/kilanimoemen/Desktop/PES

# Create virtual environment (if not already done)
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.api.txt

# Start the API server
python main.py api
```

The backend will be available at: **http://localhost:8000**
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Step 2: Start Frontend (in a new terminal)

```bash
# Open a new terminal window/tab
cd /Users/kilanimoemen/Desktop/PES/frontend

# Install dependencies (first time only)
npm install

# Start the frontend dev server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

## Complete Setup Commands

### Terminal 1: Backend
```bash
cd /Users/kilanimoemen/Desktop/PES
source .venv/bin/activate  # or: .venv\Scripts\activate on Windows
python main.py api
```

### Terminal 2: Frontend
```bash
cd /Users/kilanimoemen/Desktop/PES/frontend
npm run dev
```

## Optional: Generate Data & Train Models

Before running simulations, you might want to:

```bash
# Generate training data
python main.py generate-data

# Train models (optional, but recommended)
python main.py train --model all
```

## Verify Everything Works

1. **Backend**: Open http://localhost:8000/docs - you should see the API documentation
2. **Frontend**: Open http://localhost:3000 - you should see the dashboard
3. **Test API**: 
   ```bash
   curl http://localhost:8000/health
   ```

## Troubleshooting

### Backend Issues

**Error: Module not found**
```bash
pip install -r requirements.api.txt
```

**Error: Port 8000 already in use**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9
# Or change port in config.yaml
```

### Frontend Issues

**Error: npm command not found**
```bash
# Install Node.js from https://nodejs.org/
# Or use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

**Error: Port 3000 already in use**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
# Or change port in vite.config.js
```

## Why Run Without Docker?

✅ **Faster**: No container overhead  
✅ **Easier debugging**: Direct access to logs and code  
✅ **Hot reload**: Changes reflect immediately  
✅ **Simpler**: No Docker daemon needed  
✅ **Better for development**: Direct file watching

## If You Want to Use Docker Later

1. **Start Docker Desktop** (macOS/Windows) or Docker daemon (Linux)
2. **Then run**: `docker-compose up --build`

But for development, running locally is recommended! 🚀



