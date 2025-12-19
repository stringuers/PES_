# Solar Swarm Intelligence

A multi-agent reinforcement learning platform for optimizing community-scale solar energy usage, forecasting, and peer-to-peer energy sharing. Built for the IEEE PES Energy Utopia Challenge, the system simulates a neighborhood of solar-enabled homes, forecasts production/consumption, and coordinates agent decisions to maximize self-sufficiency, savings, and environmental impact.

---

## 🏆 Challenge Submission

This repository represents our comprehensive solution for the IEEE PES Energy Utopia Challenge, demonstrating advanced AI techniques applied to renewable energy optimization at a community scale.

---

## 🌟 Key Features

### Intelligent Multi-Agent System
- **Swarm Intelligence**: Grid topology with neighborhood energy sharing, battery dynamics, and dynamic scenarios
- **Reinforcement Learning**: PPO-based agents with tunable rewards and environment dynamics for optimal decision-making
- **Hybrid Approach**: Seamless switching between rule-based and RL-based decision making based on model availability

### Advanced Analytics & Forecasting
- **Machine Learning Models**: LSTM and Prophet models for accurate 24-hour solar production forecasting
- **Anomaly Detection**: Isolation Forest and rule-based systems for identifying unusual energy patterns
- **Real-time Predictions**: Dynamic forecasting that adapts to current conditions and historical data

### Real-time Monitoring & Control
- **Live Dashboard**: Modern React + Vite + Tailwind + Three.js interface with interactive 3D visualization
- **WebSocket Streaming**: Real-time updates of simulation status, energy flows, and agent decisions
- **RESTful API**: Comprehensive FastAPI backend with rich endpoints for system control and data access

### Physical Integration
- **IoT Prototype**: ESP32-based hardware implementation for real-world solar panel control
- **AI-Powered Control**: Edge devices receive intelligent commands from the central system
- **Sensor Integration**: Voltage, current, and temperature monitoring with relay-based control

### Performance & Scalability
- **Optimized Architecture**: Efficient handling of 100+ agents with caching and vectorized operations
- **Historical Data Storage**: SQLite-based storage for simulation results and performance metrics
- **Containerized Deployment**: Docker Compose setup for easy deployment and scaling

---

## 🛠 Tech Stack

### Backend
- **Core**: Python 3.10+, FastAPI, Uvicorn, Pydantic
- **AI/ML**: NumPy, Pandas, scikit-learn, PyTorch, TensorFlow, stable-baselines3, Statsmodels, Prophet
- **Simulation**: SimPy, Mesa
- **Data Storage**: SQLite for historical data
- **Messaging**: WebSockets for real-time communication

### Frontend
- **Framework**: React 18, Vite
- **Visualization**: Three.js, D3.js, Recharts, React Three Fiber
- **UI Library**: TailwindCSS with custom design system
- **Animation**: Framer Motion for smooth interactions
- **State Management**: React Hooks

### Hardware/IoT
- **Microcontroller**: ESP32
- **Sensors**: ADS1115 ADC, ACS712 Current Sensor, DS18B20 Temperature Sensor
- **Actuators**: 4-Channel Relay Module
- **Communication**: WiFi connectivity to backend API

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Configuration**: dotenv, PyYAML
- **Quality Assurance**: pytest, black, flake8

---

## 📁 Project Structure

```
.
├── main.py                      # CLI entrypoint (api | simulate | train | generate-data | test)
├── src/
│   ├── api/                     # FastAPI app, routes, schemas, websocket
│   ├── agents/                  # RL agents and simulation wrapper
│   ├── models/                  # Forecasting, anomaly detection, evaluation, visualization
│   ├── preprocessing/           # Cleaning, feature engineering, validation, pipelines
│   ├── data_collection/         # Weather/solar APIs, synthetic data generation
│   ├── simulation/              # Environment, grid, battery physics, neighbors
│   ├── advanced/                # Federated learning, blockchain, graph networks
│   ├── services/                # Forecasting, anomaly detection services
│   ├── utils/                   # Metrics, logging, historical storage, performance optimizer
│   └── config.py                # Config loader and env overrides
├── frontend/                    # React + Vite app (dashboard)
├── iot/                         # ESP32 Arduino code for physical prototype
├── scripts/                     # Helper scripts (e.g., deploy.sh)
├── data/                        # Raw/processed data (gitignored)
├── models/                      # Saved model artifacts (gitignored)
├── notebooks/                   # Jupyter workflows
├── logs/                        # Application logs (gitignored)
├── results/                     # Simulation/results outputs
├── requirements.txt             # Python deps
├── setup.py                    # Package metadata/entry points
├── config.yaml                 # Primary configuration
├── Dockerfile                  # Backend image
├── docker-compose.yml          # Backend + frontend + Redis
└── start-frontend.sh           # Frontend dev helper
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (recommended)
- Arduino IDE (for IoT prototype)

### Option A: Docker Compose (Recommended)
```bash
# From project root
docker-compose up --build

# Services
# - Backend API:  http://localhost:8000 (docs at /docs)
# - Frontend UI:  http://localhost:3000
# - Redis:        redis://localhost:6379
```

### Option B: Local Development

1) Backend (API)
```bash
# Python 3.10+
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Optional: copy env
cp .env.example .env  # edit values

# Run API
python main.py api
# or with reload
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```

2) Frontend (Dashboard)
```bash
# From project root
./start-frontend.sh
# or manually
cd frontend && npm install && npm run dev
```

---

## 🎮 Usage Examples

### CLI Commands
```bash
# Generate synthetic dataset (default: 50 houses x 90 days)
python main.py generate-data

# Train models
python main.py train --model lstm
python main.py train --model prophet
python main.py train --model ppo
python main.py train --model all

# Run a 24h simulation with 50 agents
python main.py simulate --agents 50 --hours 24

# Start API server
python main.py api
```

### API Endpoints (FastAPI)

#### Core Simulation
- `GET /` — Service metadata
- `GET /health` — Health status
- `GET /api/v1/simulation/status` — Current simulation status
- `POST /api/v1/simulation/start` — Start simulation
- `POST /api/v1/simulation/stop` — Stop simulation

#### Agent Management
- `GET /api/v1/agents` — List all agents
- `GET /api/v1/agents/{id}` — Specific agent details

#### Metrics & Analytics
- `GET /api/v1/metrics/community` — Aggregated community metrics
- `GET /api/v1/metrics/history` — Historical performance data
- `GET /api/v1/analytics/trends` — Performance trends

#### Forecasting
- `GET /api/v1/forecast/24h` — 24-hour production forecast

#### Scenarios
- `POST /api/v1/scenario/run` — Run predefined scenarios:
  - `cloudy_day`: Adjustable cloud cover
  - `panel_failure`: Configurable panel failures
  - `peak_demand`: Increased consumption
  - `grid_outage`: Grid unavailability
  - `heatwave`: High consumption + reduced efficiency
  - `custom`: Fully customizable parameters

#### Anomaly Detection
- `GET /api/v1/anomalies` — Current anomaly alerts

#### IoT Integration
- `POST /api/v1/iot/data` — Receive sensor data from devices
- `GET /api/v1/iot/command` — Get commands for devices
- `POST /api/v1/iot/command/confirm` — Confirm command execution

#### AI Features
- `GET /api/v1/insights/predictive` — AI-powered predictive insights
- `GET /api/v1/gamification/achievements` — Gamification metrics

### WebSocket Endpoint
- `/ws/simulation` — Real-time simulation updates

### Example: Start a 24h simulation for 60 agents
```bash
curl -X POST http://localhost:8000/api/v1/simulation/start \
  -H 'Content-Type: application/json' \
  -d '{"num_agents": 60, "hours": 24}'
```

---

## 🎨 UI/UX Design System

Our platform features a premium, warm-toned design system that creates a distinctive identity while maintaining excellent usability:

### Color Palette
- **Primary Energy Colors**: Solar amber (#F59E0B), Gold (#EAB308), Sage green (#84A98C)
- **Brand Neutrals**: Cream (#FFF8F0), Beige (#F5E6D3), Terracotta (#D4835C)
- **UI Elements**: Graphite (#1A202C), Pearl text (#E2E8F0), Silver secondary text (#94A3B8)

### Typography
- **Display**: Poppins for headings and emphasis
- **Body**: Inter for readable content
- **Monospace**: JetBrains Mono for technical data

### Component Design
- **Glass Cards**: Frosted glass effect with subtle shadows
- **Micro-interactions**: Smooth animations and hover effects
- **Responsive Layout**: Adapts seamlessly from mobile to large displays

### 3D Visualization
- **Interactive City Map**: Real-time 3D representation of the community energy network
- **Dynamic Houses**: Visual indicators for production/consumption status
- **Energy Flow Animation**: Particle-based visualization of peer-to-peer energy transfers

---

## 🤖 AI & Machine Learning

### Reinforcement Learning Agents
Our hybrid RL agents combine the reliability of rule-based systems with the optimization power of machine learning:

- **Algorithm**: Proximal Policy Optimization (PPO) for stable training
- **State Space**: Battery level, production, consumption, time, neighbor status
- **Action Space**: Charge percentage, sharing amount, selling amount
- **Reward Function**: Weighted combination of solar utilization, energy sharing, grid independence

### Forecasting Models
Accurate prediction is essential for optimal energy management:

- **LSTM Networks**: Sequential modeling for temporal patterns
- **Prophet**: Facebook's robust time series forecasting
- **Fallback System**: Sinusoidal models when ML models aren't available

### Anomaly Detection
Early identification of issues prevents energy waste and system failures:

- **Isolation Forest**: Unsupervised ML for outlier detection
- **Rule-Based Backup**: Domain-specific heuristics for critical alerts
- **Real-time Monitoring**: Continuous scanning of all agent states

---

## 🔌 IoT Integration

Our physical prototype demonstrates how AI decisions translate to real-world control:

### Hardware Components
- **ESP32 Microcontroller**: Central processing unit
- **ADS1115 ADC**: Precision analog-to-digital conversion
- **ACS712 Current Sensor**: Accurate current measurement
- **Relay Modules**: Control of battery charging/discharging and loads
- **WiFi Connectivity**: Communication with cloud backend

### Control Logic
The IoT device receives intelligent commands from our central system:
1. **Data Collection**: Sensors continuously monitor voltage, current, and temperature
2. **Cloud Communication**: Real-time data transmission to backend AI
3. **Decision Making**: Central system analyzes data and generates control commands
4. **Local Execution**: Device receives and executes commands via relays
5. **Feedback Loop**: Execution confirmation sent back to system

### Command Types
- `charge_battery`: Enable battery charging from solar excess
- `discharge_battery`: Use stored energy to meet demand
- `enable_load`/`disable_load`: Control connected appliances
- `export_to_grid`: Sell excess energy back to the grid
- `stop_battery`: Emergency shutdown of battery operations

---

## ⚙️ Configuration

### Primary Configuration
- File: `config.yaml` controls system, agents, RL, physics, economics, API, logging, paths, and targets

### Environment Variables
Override certain settings through environment variables:
- From `.env.example`:
  - `WEATHER_API_KEY`, `WEATHER_API_URL`, `PVGIS_API_URL`
  - `DATABASE_URL`, `REDIS_URL`
  - `LOG_LEVEL`, `NUM_AGENTS`, `SIMULATION_SPEED`
  - `API_HOST`, `API_PORT`, `CORS_ORIGINS`
  - `GRID_PRICE`, `SOLAR_SELL_PRICE`
  - `DEFAULT_LATITUDE`, `DEFAULT_LONGITUDE`

### Override Precedence
Environment variables override `config.yaml` selectively (see `src/config.py`).

---

## 🧪 Development & Testing

### Code Quality
- Formatting: `black`
- Linting: `flake8`
- Type checking: `mypy`

### Testing
- Framework: `pytest`
- Coverage: `pytest-cov`
- Async testing: `pytest-asyncio`

### Commands
```bash
# Lint & format
black . && flake8

# Run tests
pytest -v --tb=short

# Run with coverage
pytest --cov=src --cov-report=html
```

---

## 📈 Performance Optimization

Our system efficiently handles large-scale simulations through several optimization techniques:

### Caching Strategies
- Neighbor distance calculations cached for repeated use
- Model loading optimized for quick inference

### Computational Efficiency
- Batch processing of agent decisions
- Vectorized operations using NumPy for production/consumption calculations
- Energy flow filtering to remove negligible transfers

### Memory Management
- Database storage for historical data instead of in-memory retention
- Streaming WebSocket updates to reduce payload size

---

## 🤝 Contributing

We welcome contributions to enhance the Solar Swarm Intelligence platform:

### Workflow
1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add appropriate tests
5. Submit a pull request

### Standards
- Maintain existing code style and architecture
- Add/maintain tests for new functionality
- Keep functions small and cohesive
- Use type hints where reasonable
- Follow conventional commit messages (e.g., `feat:`, `fix:`, `docs:`)

### Before Pull Request
Ensure all quality checks pass:
- `black . && flake8` (code formatting and linting)
- `pytest -v --tb=short` (all tests passing)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Data Sources**: PVGIS for solar irradiance data, OpenWeather for weather information
- **Libraries**: Thanks to all open-source projects that made this possible
- **Challenge**: Developed for the IEEE PES Energy Utopia Challenge
- **Team**: Created by the Solar Swarm Intelligence Team

---

## 📞 Contact

For questions about this project, please open an issue or contact the development team.

Built with ❤️ for a sustainable energy future.