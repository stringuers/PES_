# Quick Setup Guide

## ✅ Essential Packages Installed

The following packages are now installed and should be enough to run the API:
- ✅ pyyaml (for config)
- ✅ fastapi (API framework)
- ✅ uvicorn (ASGI server)
- ✅ websockets (real-time updates)
- ✅ numpy, pandas (simulation)

## 🚀 Start the System

### 1. Start Backend (Terminal 1)
```bash
cd /Users/kilanimoemen/Desktop/solar-swarm-intelligence
python3 main.py api
```

You should see:
```
🚀 Starting Solar Swarm Intelligence API
   Agents: 50
   Battery: 10.0 kWh
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Start Frontend (Terminal 2)
```bash
cd /Users/kilanimoemen/Desktop/solar-swarm-intelligence/frontend
npm install  # Only needed first time
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### 3. Open Browser
Go to: `http://localhost:3000`

### 4. Test It
1. Click "Start Simulation" button
2. Watch the map update in real-time
3. See energy flows between houses
4. Check metrics updating

## ⚠️ If You Get Errors

### "Module not found" errors:
```bash
# Install missing package
python3 -m pip install <package-name>
```

### "No space left on device":
- You have limited disk space
- Essential packages are already installed
- You can skip ML packages (torch, tensorflow) for now
- They're only needed for training models, not running the API

### Backend won't start:
- Check if port 8000 is already in use
- Try: `lsof -ti:8000 | xargs kill -9`
- Or change port in `config.yaml`

### Frontend shows pink screen:
- Check browser console (F12)
- Make sure backend is running
- Check WebSocket connection

## 📦 Optional: Install All Packages Later

When you have more disk space, you can install the full requirements:
```bash
python3 -m pip install -r requirements.txt
```

This includes:
- ML libraries (torch, tensorflow) for training
- Prophet for forecasting
- Stable-baselines3 for RL
- etc.

**But these are NOT needed to run the dashboard!**

## ✅ What Works Now

With the essential packages installed:
- ✅ API server runs
- ✅ Simulation works
- ✅ WebSocket real-time updates
- ✅ Frontend dashboard
- ✅ All visualization features

What needs full packages:
- ❌ Training ML models (LSTM, Prophet, PPO)
- ❌ Advanced forecasting
- ❌ RL agent training

But you can still:
- ✅ Run simulations
- ✅ See real-time updates
- ✅ Visualize energy flows
- ✅ Test scenarios
- ✅ View all metrics

## 🎯 Next Steps

1. **Test the system** - Start backend and frontend, click "Start Simulation"
2. **Verify it works** - Check map updates, energy flows, metrics
3. **Explore features** - Try scenarios, click houses, view analytics
4. **Install full packages later** - When you need ML training features

---

**The system should work now!** 🎉

