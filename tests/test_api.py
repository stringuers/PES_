"""
Test API Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


class TestAPIEndpoints:
    """Test REST API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_health_check(self):
        """Test health endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_simulation_status(self):
        """Test simulation status endpoint"""
        response = client.get("/api/v1/simulation/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
    
    def test_start_simulation(self):
        """Test starting simulation"""
        response = client.post(
            "/api/v1/simulation/start",
            json={"num_agents": 10, "hours": 2}
        )
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_invalid_simulation_params(self):
        """Test invalid simulation parameters"""
        response = client.post(
            "/api/v1/simulation/start",
            json={"num_agents": -1, "hours": 2}
        )
        assert response.status_code == 422  # Validation error


class TestAPISchemas:
    """Test Pydantic schemas"""
    
    def test_simulation_request_schema(self):
        """Test SimulationStartRequest schema"""
        from src.api.schemas import SimulationStartRequest
        
        request = SimulationStartRequest(num_agents=50, hours=24)
        assert request.num_agents == 50
        assert request.hours == 24
    
    def test_agent_info_schema(self):
        """Test AgentInfo schema"""
        from src.api.schemas import AgentInfo
        
        info = AgentInfo(
            id=0,
            battery_level=5.0,
            battery_capacity=10.0,
            production=3.0,
            consumption=2.0,
            status="surplus",
            neighbors=[1, 2, 3]
        )
        assert info.id == 0
        assert info.status == "surplus"
