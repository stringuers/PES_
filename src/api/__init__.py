"""
API Package
FastAPI application for Solar Swarm Intelligence
"""

from .main import app
from .routes import router
from .websocket import SimulationWebSocket

__all__ = ['app', 'router', 'SimulationWebSocket']
