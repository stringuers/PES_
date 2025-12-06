# Solar Swarm Intelligence - Frontend Dashboard

A comprehensive React dashboard for monitoring and controlling the Solar Swarm Intelligence multi-agent system.

## Features

### 🏘️ Live Community Map
- Interactive 2D grid visualization of all houses
- Color-coded status indicators (Green: surplus, Yellow: balanced, Red: deficit)
- Real-time energy flow visualization between houses
- Click any house to view detailed information

### 📊 Real-Time Metrics Panel
- Solar usage rate with trend indicators
- Community battery level
- Grid dependency tracking
- Cost savings (daily/monthly)
- CO₂ emissions avoided
- Peer-to-peer energy sharing statistics

### 🔮 Solar Forecasting Dashboard
- 6-hour production forecast with confidence intervals
- Weather forecast integration
- Prediction alerts for cloud cover and demand spikes
- Action recommendations

### 🤖 Swarm Intelligence Monitor
- Active agent count and message rates
- Current energy negotiations between houses
- Recent agent decisions log
- RL learning progress tracking

### 🚨 Anomaly Detection & Alerts
- System health monitoring
- Real-time anomaly alerts
- Detection accuracy metrics
- Predicted issues for next 24 hours

### 🎮 Scenario Simulator
- Pre-built scenarios (cloudy day, panel failure, peak demand, etc.)
- Custom scenario builder with weather and demand controls
- Test swarm resilience to various conditions

### 🏠 Individual House View
- Detailed house statistics
- Today's activity breakdown
- AI agent status
- Cost savings per house

### 📈 Historical Analytics
- Solar usage trends over time
- Energy distribution charts
- Cumulative impact metrics
- Time range selection (24h, 7 days, 30 days)

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## Configuration

Set the API URL in `.env`:
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **SVG** - 2D map visualization

## Component Structure

```
src/
├── App.jsx                    # Main app with layout
├── api.js                     # API client functions
├── components/
│   ├── LiveCommunityMap.jsx  # 2D neighborhood map
│   ├── RealTimeMetrics.jsx   # KPI dashboard
│   ├── SolarForecast.jsx     # Forecasting panel
│   ├── SwarmMonitor.jsx      # Agent activity monitor
│   ├── AnomalyDetection.jsx # Alert system
│   ├── ScenarioSimulator.jsx # Scenario controls
│   ├── HouseDetails.jsx      # House detail modal
│   └── HistoricalAnalytics.jsx # Analytics view
└── index.css                 # Global styles
```

## Usage

1. **Start the backend API** (see main README)
2. **Start the frontend**: `npm run dev`
3. **Start a simulation** using the "Start Simulation" button
4. **Monitor real-time updates** via WebSocket
5. **Click houses** on the map to see details
6. **Run scenarios** to test system resilience
7. **View analytics** in the Historical Analytics tab

## Features in Detail

### Real-Time Updates
The dashboard connects to the backend via WebSocket for real-time updates every 5 seconds, showing:
- Agent status changes
- Energy flow updates
- Metric changes
- New alerts

### Interactive Map
- Hover over houses to see ID and production
- Click houses to open detailed view
- Energy flows animate between connected houses
- Color coding updates based on real-time status

### Scenario Testing
Test how the swarm responds to:
- ☁️ Cloud cover (reduced production)
- 🔥 Demand spikes
- 🔧 Panel failures
- ⚡ Grid outages
- 🌙 Night mode
- 🌡️ Heatwaves

Custom scenarios allow fine-tuned testing with weather and demand sliders.

