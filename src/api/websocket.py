from fastapi import WebSocket
import asyncio
import json

class SimulationWebSocket:
    """
    WebSocket manager for real-time simulation updates
    """
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, data: dict):
        """
        Send data to all connected clients
        """
        message = json.dumps(data)
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)
    
    async def run_simulation(self, simulator):
        """
        Run simulation and stream updates
        """
        for hour in range(24):
            # Run one simulation step
            results = simulator.step(hour)
            
            # Prepare data for frontend
            update = {
                'timestamp': hour,
                'houses': [
                    {
                        'id': i,
                        'production': agent.production,
                        'consumption': agent.consumption,
                        'battery': agent.battery_level,
                        'status': 'surplus' if agent.production > agent.consumption else 'deficit'
                    }
                    for i, agent in enumerate(simulator.agents)
                ],
                'energyFlows': results['energy_transfers'],
                'metrics': {
                    'solarUsage': results['solar_usage_pct'],
                    'batteryLevel': results['avg_battery'],
                    'costSavings': results['cost_savings'],
                    'co2Saved': results['co2_saved']
                },
                'agentMessages': results['agent_decisions']
            }
            
            # Broadcast to all clients
            await self.broadcast(update)
            
            # Wait 1 second before next update
            await asyncio.sleep(1)


# FastAPI endpoint
from fastapi import FastAPI, WebSocket

app = FastAPI()
ws_manager = SimulationWebSocket()

@app.websocket("/ws/simulation")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except:
        ws_manager.disconnect(websocket)