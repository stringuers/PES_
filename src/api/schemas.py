"""
Pydantic Schemas for API Request/Response Models
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SimulationStatus(BaseModel):
    """Current simulation status"""
    status: str = Field(..., description="idle, running, completed, error")
    current_hour: int = Field(..., description="Current simulation hour")
    total_hours: int = Field(..., description="Total simulation hours")
    agents_active: int = Field(..., description="Number of active agents")
    message: str = Field(..., description="Status message")

class SimulationStartRequest(BaseModel):
    """Request to start a new simulation"""
    num_agents: int = Field(50, ge=1, le=100, description="Number of agents")
    hours: int = Field(24, ge=1, le=168, description="Simulation duration in hours")
    scenario: Optional[str] = Field(None, description="Scenario type")

class AgentInfo(BaseModel):
    """Information about a single agent"""
    id: int
    battery_level: float = Field(..., description="Current battery level (kWh)")
    battery_capacity: float = Field(..., description="Total battery capacity (kWh)")
    production: float = Field(..., description="Current production (kW)")
    consumption: float = Field(..., description="Current consumption (kW)")
    status: str = Field(..., description="surplus, deficit, or balanced")
    neighbors: List[int] = Field(..., description="List of neighbor agent IDs")

class CommunityMetrics(BaseModel):
    """Community-wide performance metrics"""
    solar_utilization_pct: float = Field(..., description="Percentage of solar energy used")
    self_sufficiency_pct: float = Field(..., description="Energy self-sufficiency percentage")
    grid_dependency_pct: float = Field(..., description="Grid dependency percentage")
    energy_shared_kwh: float = Field(..., description="Total energy shared between neighbors")
    cost_savings_daily: float = Field(..., description="Daily cost savings (TND)")
    cost_savings_monthly: float = Field(..., description="Monthly cost savings (TND)")
    co2_avoided_kg: float = Field(..., description="CO2 emissions avoided (kg)")
    trees_equivalent: float = Field(..., description="Equivalent number of trees")

class ScenarioRequest(BaseModel):
    """Request to run a specific scenario"""
    scenario_type: str = Field(..., description="cloudy_day, panel_failure, peak_demand, custom")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Custom scenario parameters")

class ForecastPoint(BaseModel):
    """Single forecast data point"""
    timestamp: str
    predicted_kwh: float
    confidence_lower: float
    confidence_upper: float

class ForecastResponse(BaseModel):
    """24-hour forecast response"""
    forecast_horizon_hours: int = Field(24, description="Forecast horizon")
    model_type: str = Field(..., description="LSTM, Prophet, or Ensemble")
    forecast: List[ForecastPoint]

class AgentDecision(BaseModel):
    """Agent decision log"""
    agent_id: int
    timestamp: str
    action: str = Field(..., description="charge_battery, share_energy, sell_to_grid, request_energy")
    amount: float = Field(..., description="Energy amount (kWh)")
    target: Optional[int] = Field(None, description="Target agent ID for sharing")

class EnergyFlow(BaseModel):
    """Energy flow between agents"""
    from_agent: int
    to_agent: int
    amount_kwh: float
    timestamp: str

class WebSocketUpdate(BaseModel):
    """Real-time WebSocket update message"""
    timestamp: int
    houses: List[Dict[str, Any]]
    energy_flows: List[Dict[str, Any]]
    metrics: Dict[str, float]
    agent_messages: List[Dict[str, Any]]

class ModelTrainingRequest(BaseModel):
    """Request to train a model"""
    model_type: str = Field(..., description="lstm, prophet, ppo")
    data_path: str = Field(..., description="Path to training data")
    epochs: Optional[int] = Field(50, description="Number of training epochs")
    hyperparameters: Optional[Dict[str, Any]] = Field(None, description="Model hyperparameters")

class ModelTrainingResponse(BaseModel):
    """Model training response"""
    model_type: str
    status: str = Field(..., description="training, completed, failed")
    metrics: Optional[Dict[str, float]] = Field(None, description="Training metrics")
    model_path: Optional[str] = Field(None, description="Path to saved model")

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field("healthy", description="System health status")
    timestamp: float
    version: str = Field("1.0.0", description="API version")

class IoTDataRequest(BaseModel):
    """IoT sensor data request from ESP32"""
    device_id: str = Field(..., description="Device identifier")
    sensor_data: Dict[str, Any] = Field(..., description="Sensor readings")
    timestamp: str = Field(..., description="ISO timestamp")

class IoTCommandResponse(BaseModel):
    """IoT command response"""
    command: Dict[str, Any] = Field(..., description="Command to execute")
    timestamp: str = Field(..., description="Command timestamp")

class IoTDataResponse(BaseModel):
    """IoT data processing response"""
    status: str = Field(..., description="Processing status")
    power_kw: float = Field(..., description="Power in kilowatts")
    anomalies_detected: int = Field(0, description="Number of anomalies detected")
    forecast_next_hour: float = Field(..., description="Forecasted production for next hour")
    command: Dict[str, Any] = Field(..., description="AI-generated command")
    timestamp: str = Field(..., description="Response timestamp")
