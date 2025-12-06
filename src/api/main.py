"""
FastAPI Main Application
Real-time solar swarm intelligence API
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
from contextlib import asynccontextmanager

from .routes import router
from .websocket import SimulationWebSocket
from ..utils.logger import logger
from ..config import config

# WebSocket manager
ws_manager = SimulationWebSocket()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting Solar Swarm Intelligence API")
    logger.info(f"   Agents: {config.num_agents}")
    logger.info(f"   Battery: {config.battery_capacity} kWh")
    yield
    # Shutdown
    logger.info("🛑 Shutting down API")

# Create FastAPI app
app = FastAPI(
    title="Solar Swarm Intelligence API",
    description="Multi-agent reinforcement learning for community solar optimization",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Solar Swarm Intelligence API",
        "version": "1.0.0",
        "status": "operational",
        "agents": config.num_agents
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": asyncio.get_event_loop().time()
    }

# WebSocket endpoint
@app.websocket("/ws/simulation")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time simulation updates via WebSocket"""
    await ws_manager.connect(websocket)
    logger.info(f"WebSocket client connected. Total: {len(ws_manager.active_connections)}")
    
    try:
        while True:
            # Keep connection alive and receive messages
            data = await websocket.receive_text()
            
            # Handle client messages if needed
            if data == "ping":
                await websocket.send_text("pong")
    
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        logger.info(f"WebSocket client disconnected. Remaining: {len(ws_manager.active_connections)}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Endpoint not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.api.main:app",
        host=config.api_host,
        port=config.api_port,
        reload=True,
        log_level=config.log_level.lower()
    )
