# Quick Start

Get the Solar Swarm Intelligence stack running in minutes.

---

## System Requirements

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional but recommended)
- macOS/Linux/Windows

---

## Option A — Run with Docker (Recommended)

```bash
# From project root
docker-compose up --build
```

- Backend API: http://localhost:8000 (docs at /docs)
- Frontend UI: http://localhost:3000
- Redis: redis://localhost:6379

Stop services:
```bash
docker-compose down
```

---

## Option B — Run Locally

1) Backend (API)
```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # optional; edit values
python main.py api          # starts FastAPI on http://localhost:8000
```

2) Frontend (Dashboard)
```bash
./start-frontend.sh         # or: cd frontend && npm install && npm run dev
# UI will be available at http://localhost:3000
```

---

## Common Commands

- Build & run (Docker):
```bash
docker-compose up --build
```

- Generate synthetic data:
```bash
python main.py generate-data
```

- Train models:
```bash
python main.py train --model lstm
python main.py train --model prophet
python main.py train --model ppo
```

- Run simulation:
```bash
python main.py simulate --agents 50 --hours 24
```

- Run tests and lint:
```bash
pytest -v --tb=short
black . && flake8
```

---

## Configuration

- Primary config: `config.yaml`
- Environment overrides: `.env` (see `.env.example`)
- Key vars: `API_HOST`, `API_PORT`, `CORS_ORIGINS`, `NUM_AGENTS`, `WEATHER_API_KEY`

---

## Next Steps

- Explore API docs at `http://localhost:8000/docs`
- Open the dashboard at `http://localhost:3000`
- Try a scenario via API:
```bash
curl -X POST http://localhost:8000/api/v1/scenario/run \
  -H 'Content-Type: application/json' \
  -d '{"scenario_type":"cloudy_day"}'
```
