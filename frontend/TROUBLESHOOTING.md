# Troubleshooting Guide

## Pink Screen Issue

If you're seeing a pink screen, it usually indicates a React error. Here's how to fix it:

### 1. Check Browser Console
Open your browser's developer console (F12 or Cmd+Option+I) and look for error messages. The error will tell you what's wrong.

### 2. Common Issues

#### Missing Dependencies
```bash
cd frontend
npm install
```

#### Backend Not Running
Make sure the backend API is running on `http://localhost:8000`. The frontend will show errors if it can't connect.

#### Port Already in Use
If port 3000 is already in use:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- --port 3001
```

### 3. Clear Cache and Reinstall
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 4. Check for Build Errors
```bash
cd frontend
npm run build
```

### 5. Verify Tailwind CSS
Make sure Tailwind is properly configured:
- `tailwind.config.js` exists
- `postcss.config.js` exists
- `src/index.css` imports Tailwind directives

### 6. Check Component Imports
All components should be in `src/components/`:
- LiveCommunityMap.jsx
- RealTimeMetrics.jsx
- SolarForecast.jsx
- SwarmMonitor.jsx
- AnomalyDetection.jsx
- ScenarioSimulator.jsx
- HouseDetails.jsx
- HistoricalAnalytics.jsx

### 7. Error Boundary
The app now includes an ErrorBoundary component that will show a proper error message instead of a pink screen. Check the error message displayed.

### 8. WebSocket Connection
If WebSocket fails, the app will continue to work but won't have real-time updates. Check:
- Backend is running
- WebSocket endpoint is accessible
- No firewall blocking the connection

## Still Having Issues?

1. Check the browser console for specific error messages
2. Verify all files are saved correctly
3. Try restarting the dev server
4. Check that Node.js version is 18+ (`node --version`)

