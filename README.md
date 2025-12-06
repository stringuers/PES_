# Solar Swarm Intelligence

A multi-agent reinforcement learning platform for optimizing community-scale solar energy usage, forecasting, and peer-to-peer energy sharing. Built for the IEEE PES Energy Utopia Challenge, the system simulates a neighborhood of solar-enabled homes, forecasts production/consumption, and coordinates agent decisions to maximize self-sufficiency, savings, and environmental impact.

---

## Badges

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-green)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)
![Docker](https://img.shields.io/badge/Docker-Compose-informational)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## Key Features

- **Multi-agent simulation**: Grid topology, neighborhood energy sharing, battery dynamics, and scenarios.
- **Reinforcement learning (RL)**: PPO-based agents with tunable rewards and environment dynamics.
- **Forecasting**: LSTM and Prophet models for 24h solar production patterns.
- **Anomaly detection**: Isolation Forest and Autoencoder baselines.
- **Real-time API**: FastAPI REST + WebSocket streaming for simulation updates.
- **Modern dashboard**: React + Vite + Tailwind + Three.js for 3D/interactive visualization.
- **Dockerized dev**: docker-compose for backend, frontend, and Redis.

---

## Tech Stack

- **Backend**: Python, FastAPI, Uvicorn, Pydantic, websockets
- **ML/RL**: NumPy, Pandas, scikit-learn, PyTorch, TensorFlow, stable-baselines3, Statsmodels, Prophet
- **Simulation**: SimPy, Mesa
- **Frontend**: React 18, Vite, TailwindCSS, Recharts, Three.js, Axios
- **Ops**: Docker, Docker Compose, dotenv, PyYAML
- **Testing & Quality**: pytest, pytest-asyncio, pytest-cov, black, flake8

---

## Folder Structure

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
│   └── config.py                # Config loader and env overrides
├── frontend/                    # React + Vite app (dashboard)
├── scripts/                     # Helper scripts (e.g., deploy.sh)
├── data/                        # Raw/processed data (gitignored)
├── models/                      # Saved model artifacts (gitignored)
├── notebooks/                   # Jupyter workflows
├── logs/                        # Application logs (gitignored)
├── results/                     # Simulation/results outputs
├── requirements.txt             # Python deps
├── setup.py                     # Package metadata/entry points
├── config.yaml                  # Primary configuration
├── Dockerfile                   # Backend image
├── docker-compose.yml           # Backend + frontend + Redis
└── start-frontend.sh            # Frontend dev helper
```

---

## Installation & Setup

You can run the full stack with Docker (recommended) or locally with Python/Node.

### Option A: Docker Compose

```bash
# From project root
docker-compose up --build

# Services
# - Backend API:  http://localhost:8000 (docs at /docs)
# - Frontend UI:  http://localhost:3000
# - Redis:        redis://localhost:6379
```

Environment can be customized via `.env` and `config.yaml` (see Configuration).

### Option B: Local Development

1) Python backend
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

2) Frontend
```bash
# From project root
./start-frontend.sh
# or manually
cd frontend && npm install && npm run dev
```

---

## Usage Examples

### CLI commands

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

### API endpoints (FastAPI)

- `GET /` — service metadata
- `GET /health` — health status
- `GET /api/v1/simulation/status` — current simulation status
- `POST /api/v1/simulation/start` — start simulation
- `POST /api/v1/simulation/stop` — stop simulation
- `GET /api/v1/agents` — list agents
- `GET /api/v1/agents/{id}` — agent details
- `GET /api/v1/metrics/community` — aggregated community metrics
- `POST /api/v1/scenario/run` — run scenario (cloudy_day, panel_failure, peak_demand, custom)
- `GET /api/v1/forecast/24h` — 24-hour production forecast
- WebSocket: `/ws/simulation` — real-time updates

Example: start a 24h simulation for 60 agents
```bash
curl -X POST http://localhost:8000/api/v1/simulation/start \
  -H 'Content-Type: application/json' \
  -d '{"num_agents": 60, "hours": 24}'
```

---

## Configuration

- Primary file: `config.yaml` controls system, agents, RL, physics, economics, API, logging, paths, and targets.
- Environment variables (override certain settings):
  - From `.env.example`:
    - `WEATHER_API_KEY`, `WEATHER_API_URL`, `PVGIS_API_URL`
    - `DATABASE_URL`, `REDIS_URL`
    - `LOG_LEVEL`, `NUM_AGENTS`, `SIMULATION_SPEED`
    - `API_HOST`, `API_PORT`, `CORS_ORIGINS`
    - `GRID_PRICE`, `SOLAR_SELL_PRICE`
    - `DEFAULT_LATITUDE`, `DEFAULT_LONGITUDE`
- Override precedence: environment variables override `config.yaml` selectively (see `src/config.py`).

---

## Development

- Code style: `black`, lint: `flake8`
- Tests: `pytest`, coverage: `pytest-cov`

```bash
# Lint & format
black . && flake8

# Run tests
pytest -v --tb=short
```

---

## Contributing

- **Workflow**: Fork → feature branch → PR
- **Standards**: Add/maintain tests, keep functions small/cohesive, type hints where reasonable
- **Commit style**: Conventional commits (e.g., `feat:`, `fix:`, `docs:`)
- **Before PR**: `black`, `flake8`, `pytest` must pass

---

## License & Acknowledgments

- License: **MIT** (see `LICENSE`).
- Data/Services: PVGIS for solar irradiance, OpenWeather for weather data.
- Built by the Solar Swarm Intelligence Team for the IEEE PES Energy Utopia Challenge.

---


