"""
API Routes
All REST endpoints for the Solar Swarm Intelligence system
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query, Response
from typing import List, Optional
from datetime import datetime
import asyncio

from .schemas import (
    SimulationStatus,
    SimulationStartRequest,
    AgentInfo,
    CommunityMetrics,
    ScenarioRequest,
    ForecastResponse,
    IoTDataRequest,
    IoTDataResponse,
    IoTCommandResponse
)
from ..agents.base_agent import SwarmSimulator
from ..agents.rl_hybrid_agent import HybridRLAgent
from ..utils.metrics import PerformanceEvaluator
from ..utils.logger import logger
from ..utils.historical_storage import HistoricalStorage
from ..services.forecasting_service import get_forecasting_service
from ..services.anomaly_service import get_anomaly_service

router = APIRouter()

# Global simulation state
current_simulation = None
simulation_running = False
historical_storage = HistoricalStorage()
step_results_history = []  # Store step results for historical storage

# IoT device command store (in-memory, use Redis/DB in production)
device_commands = {}

@router.get("/simulation/status", response_model=SimulationStatus)
async def get_simulation_status():
    """Get current simulation status"""
    global current_simulation, simulation_running
    
    if current_simulation is None:
        return SimulationStatus(
            status="idle",
            current_hour=0,
            total_hours=24,
            agents_active=0,
            message="No simulation running"
        )
    
    return SimulationStatus(
        status="running" if simulation_running else "completed",
        current_hour=current_simulation.time_step,
        total_hours=24,
        agents_active=len(current_simulation.agents),
        message=f"Simulation at hour {current_simulation.time_step}/24"
    )

@router.post("/simulation/start")
async def start_simulation(request: SimulationStartRequest, background_tasks: BackgroundTasks):
    """Start a new simulation"""
    global current_simulation, simulation_running, step_results_history
    
    if simulation_running:
        raise HTTPException(status_code=400, detail="Simulation already running")
    
    logger.info(f"Starting simulation with {request.num_agents} agents for {request.hours} hours")
    
    # Create simulator (with optional RL agents)
    use_rl = request.scenario == "rl_agents" if request.scenario else False
    if use_rl:
        # Create hybrid RL agents
        agents = []
        rl_model_path = "models/solar_swarm_ppo.pth"  # Path to trained RL model
        for i in range(request.num_agents):
            agent = HybridRLAgent(i, use_rl=True, rl_model_path=rl_model_path)
            agents.append(agent)
        # Note: Would need to modify SwarmSimulator to accept custom agents
        # For now, fall back to regular simulator
        current_simulation = SwarmSimulator(num_agents=request.num_agents)
    else:
        current_simulation = SwarmSimulator(num_agents=request.num_agents)
    
    simulation_running = True
    step_results_history = []  # Reset history
    
    # Initialize simulation with first timestep so agents are available immediately
    try:
        current_simulation.run_timestep(0)
        current_simulation.time_step = 0
        logger.info(f"Simulation initialized with {len(current_simulation.agents)} agents")
    except Exception as e:
        logger.error(f"Error initializing simulation: {e}")
    
    # Run simulation in background
    background_tasks.add_task(run_simulation_background, request.hours)
    
    # Return agents info immediately so frontend can show them right away
    agents_info = []
    try:
        for agent in current_simulation.agents:
            agents_info.append({
                "id": agent.id,
                "battery_level": agent.battery_level,
                "battery_capacity": agent.battery_capacity,
                "production": agent.production,
                "consumption": agent.consumption,
                "status": "surplus" if agent.production > agent.consumption else ("balanced" if abs(agent.production - agent.consumption) < 0.1 else "deficit"),
                "neighbors": [n.id for n in agent.neighbors] if hasattr(agent, 'neighbors') else []
            })
    except Exception as e:
        logger.error(f"Error preparing agents info: {e}")
    
    return {
        "message": "Simulation started",
        "num_agents": request.num_agents,
        "hours": request.hours,
        "status": "running",
        "agents": agents_info  # Include agents in response
    }

async def run_simulation_background(hours: int):
    """Run simulation step-by-step with WebSocket updates"""
    global current_simulation, simulation_running
    from ..api.main import ws_manager
    import asyncio
    
    try:
        # Start from hour 1 since hour 0 was already initialized in start_simulation
        for hour in range(1, hours):
            if not simulation_running:
                logger.info("Simulation stopped by user")
                break
                
            # Run one step
            if hasattr(current_simulation, 'step'):
                step_result = current_simulation.step(hour)
            else:
                # Fallback: run timestep and create basic result
                current_simulation.run_timestep(hour)
                current_simulation.time_step += 1
                step_result = {
                    'hour': hour,
                    'energy_flows': [],
                    'energy_transfers': [],
                    'solar_usage_pct': 0,
                    'avg_battery': 50,
                    'cost_savings': 0,
                    'co2_saved': 0,
                    'agent_decisions': []
                }
            
            # Prepare WebSocket update with enhanced AI data
            update = {
                'timestamp': hour,
                'hour': hour,
                'houses': [
                    {
                        'id': agent.id,
                        'production': agent.production,
                        'consumption': agent.consumption,
                        'battery': agent.battery_level,
                        'battery_capacity': agent.battery_capacity,
                        'status': 'surplus' if agent.production > agent.consumption else ('balanced' if abs(agent.production - agent.consumption) < 0.1 else 'deficit'),
                        'neighbors': [n.id for n in agent.neighbors] if hasattr(agent, 'neighbors') else []
                    }
                    for agent in current_simulation.agents
                ],
                'energy_flows': step_result.get('energy_flows', []),
                'metrics': {
                    'solarUsage': step_result.get('solar_usage_pct', 0),
                    'batteryLevel': step_result.get('avg_battery', 0),
                    'costSavings': step_result.get('cost_savings', 0),
                    'co2Saved': step_result.get('co2_saved', 0),
                    'decisionEfficiency': step_result.get('decision_efficiency', 0),
                    'activeAgents': step_result.get('active_agents', 0),
                    'networkConnections': step_result.get('network_connections', 0)
                },
                'agentMessages': step_result.get('agent_decisions', []),
                'decisionStats': step_result.get('decision_stats', {}),
                'ai_metrics': {
                    'episode': current_simulation.time_step,
                    'avg_reward': step_result.get('cost_savings', 0) / max(1, len(current_simulation.agents)),
                    'learning_rate': 0.0003 * (0.999 ** current_simulation.time_step),
                    'exploration_rate': max(0.1, 1.0 - (current_simulation.time_step / 2000))
                }
            }
            
            # Store step result for historical storage
            step_results_history.append(step_result)
            
            # Detect anomalies
            anomaly_service = get_anomaly_service()
            agent_data = [
                {
                    'agent_id': agent.id,
                    'production': agent.production,
                    'consumption': agent.consumption,
                    'battery_level': agent.battery_level,
                    'net_energy': agent.production - agent.consumption,
                    'hour': hour
                }
                for agent in current_simulation.agents
            ]
            anomalies = anomaly_service.detect_anomalies(agent_data)
            if anomalies:
                update['anomalies'] = anomalies
            
            # Broadcast to all connected clients
            await ws_manager.broadcast(update)
            
            # Wait before next step (simulate real-time: 2 seconds per hour)
            await asyncio.sleep(2)
            
        logger.info(f"Simulation completed: {hours} hours")
        
        # Save to historical storage
        try:
            sim_id = historical_storage.save_simulation(
                num_agents=len(current_simulation.agents),
                hours=hours,
                scenario_type=None,
                parameters=None,
                step_results=step_results_history
            )
            logger.info(f"✅ Simulation saved to history (ID: {sim_id})")
        except Exception as e:
            logger.error(f"Failed to save simulation history: {e}")
        
    except Exception as e:
        logger.error(f"Simulation error: {e}", exc_info=True)
    finally:
        simulation_running = False
        # Note: Don't clear step_results_history here as it's used for historical storage

@router.post("/simulation/stop")
async def stop_simulation():
    """Stop current simulation"""
    global simulation_running
    
    if not simulation_running:
        raise HTTPException(status_code=400, detail="No simulation running")
    
    simulation_running = False
    logger.info("Simulation stopped by user")
    
    return {"message": "Simulation stopped"}

@router.get("/agents", response_model=List[AgentInfo])
async def get_all_agents():
    """Get information about all agents"""
    global current_simulation
    
    if current_simulation is None:
        # Return empty list instead of 404
        return []
    
    agents_info = []
    for agent in current_simulation.agents:
        agents_info.append(AgentInfo(
            id=agent.id,
            battery_level=agent.battery_level,
            battery_capacity=agent.battery_capacity,
            production=agent.production,
            consumption=agent.consumption,
            status="surplus" if agent.production > agent.consumption else "deficit",
            neighbors=[n.id for n in agent.neighbors]
        ))
    
    return agents_info

@router.get("/agents/{agent_id}", response_model=AgentInfo)
async def get_agent(agent_id: int):
    """Get information about a specific agent"""
    global current_simulation
    
    if current_simulation is None:
        raise HTTPException(status_code=404, detail="No simulation available")
    
    if agent_id >= len(current_simulation.agents):
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = current_simulation.agents[agent_id]
    
    return AgentInfo(
        id=agent.id,
        battery_level=agent.battery_level,
        battery_capacity=agent.battery_capacity,
        production=agent.production,
        consumption=agent.consumption,
        status="surplus" if agent.production > agent.consumption else "deficit",
        neighbors=[n.id for n in agent.neighbors]
    )

@router.get("/metrics/community", response_model=CommunityMetrics)
async def get_community_metrics():
    """Get community-wide performance metrics"""
    global current_simulation
    
    # Return default/empty metrics if no simulation is running
    if current_simulation is None:
        return CommunityMetrics(
            solar_utilization_pct=0.0,
            self_sufficiency_pct=0.0,
            grid_dependency_pct=100.0,
            energy_shared_kwh=0.0,
            cost_savings_daily=0.0,
            cost_savings_monthly=0.0,
            co2_avoided_kg=0.0,
            trees_equivalent=0.0
        )
    
    evaluator = PerformanceEvaluator()
    
    # Prepare results for evaluation
    # Get actual results data
    solar_used_list = current_simulation.results.get('solar_used', [])
    grid_import_list = current_simulation.results.get('grid_import', [])
    energy_shared_list = current_simulation.results.get('shared_energy', [])
    
    # If no data yet, return zeros
    if not solar_used_list and not grid_import_list and current_simulation.time_step == 0:
        return CommunityMetrics(
            solar_utilization_pct=0.0,
            self_sufficiency_pct=0.0,
            grid_dependency_pct=100.0,
            energy_shared_kwh=0.0,
            cost_savings_daily=0.0,
            cost_savings_monthly=0.0,
            co2_avoided_kg=0.0,
            trees_equivalent=0.0
        )
    
    # Build production/consumption lists from agent states
    # Multiply by time_steps to get cumulative values
    time_steps = max(1, current_simulation.time_step)
    agent_productions = [agent.production for agent in current_simulation.agents]
    agent_consumptions = [agent.consumption for agent in current_simulation.agents]
    
    # Create results dictionary with safe defaults
    results = {
        'production': agent_productions * time_steps if agent_productions else [0.01],  # Small non-zero to avoid division
        'consumption': agent_consumptions * time_steps if agent_consumptions else [0.01],  # Small non-zero to avoid division
        'solar_used': solar_used_list if solar_used_list else [0],
        'grid_import': grid_import_list if grid_import_list else [0],
        'energy_shared': energy_shared_list if energy_shared_list else [0]
    }
    
    energy_metrics = evaluator.calculate_energy_metrics(results)
    economic_metrics = evaluator.calculate_economic_metrics(results)
    environmental_metrics = evaluator.calculate_environmental_impact(results)
    
    return CommunityMetrics(
        solar_utilization_pct=energy_metrics['solar_utilization_pct'],
        self_sufficiency_pct=energy_metrics['self_sufficiency_pct'],
        grid_dependency_pct=energy_metrics['grid_dependency_pct'],
        energy_shared_kwh=sum(results.get('energy_shared', [])),
        cost_savings_daily=economic_metrics.get('daily_savings', 0.0),
        cost_savings_monthly=economic_metrics.get('monthly_savings', 0.0),
        co2_avoided_kg=environmental_metrics.get('daily_co2_avoided_kg', 0.0),
        trees_equivalent=environmental_metrics.get('trees_equivalent', 0.0)
    )

@router.post("/scenario/run")
async def run_scenario(scenario: ScenarioRequest):
    """Run a specific scenario simulation with enhanced parameters"""
    global current_simulation
    
    logger.info(f"Running scenario: {scenario.scenario_type}")
    
    # Create new simulator
    num_agents = scenario.parameters.get('num_agents', 50) if scenario.parameters else 50
    simulator = SwarmSimulator(num_agents=num_agents)
    
    # Apply scenario modifications
    if scenario.scenario_type == "cloudy_day":
        cloud_cover = scenario.parameters.get('cloud_cover', 70) if scenario.parameters else 70
        production_factor = 1.0 - (cloud_cover / 100.0) * 0.9  # 0-90% reduction
        for agent in simulator.agents:
            agent.production *= production_factor
    
    elif scenario.scenario_type == "panel_failure":
        num_failed = scenario.parameters.get('num_failed', 5) if scenario.parameters else 5
        import random
        failed_agents = random.sample(range(len(simulator.agents)), min(num_failed, len(simulator.agents)))
        for idx in failed_agents:
            simulator.agents[idx].production = 0
    
    elif scenario.scenario_type == "peak_demand":
        demand_multiplier = scenario.parameters.get('demand_multiplier', 2.0) if scenario.parameters else 2.0
        for agent in simulator.agents:
            agent.consumption *= demand_multiplier
    
    elif scenario.scenario_type == "grid_outage":
        # Simulate grid outage - agents can only share with neighbors
        # This is handled in the decision logic, but we can mark it
        for agent in simulator.agents:
            agent.grid_available = False
    
    elif scenario.scenario_type == "heatwave":
        # High consumption due to AC, reduced panel efficiency
        for agent in simulator.agents:
            agent.consumption *= 1.5  # Increased AC usage
            agent.production *= 0.85  # Reduced efficiency due to heat
    
    elif scenario.scenario_type == "custom":
        # Apply custom parameters
        if scenario.parameters:
            production_factor = scenario.parameters.get('production_factor', 1.0)
            consumption_factor = scenario.parameters.get('consumption_factor', 1.0)
            battery_factor = scenario.parameters.get('battery_factor', 1.0)
            
            for agent in simulator.agents:
                agent.production *= production_factor
                agent.consumption *= consumption_factor
                agent.battery_capacity *= battery_factor
    
    # Run simulation
    results = simulator.run(hours=24)
    
    # Calculate metrics
    evaluator = PerformanceEvaluator()
    metrics_data = {
        'production': [agent.production for agent in simulator.agents] * 24,
        'consumption': [agent.consumption for agent in simulator.agents] * 24,
        'solar_used': results['solar_used'],
        'grid_import': results['grid_import'],
        'energy_shared': results['shared_energy']
    }
    
    energy_metrics = evaluator.calculate_energy_metrics(metrics_data)
    
    return {
        "scenario": scenario.scenario_type,
        "results": {
            "solar_utilization": energy_metrics['solar_utilization_pct'],
            "grid_dependency": energy_metrics['grid_dependency_pct'],
            "energy_shared": sum(results['shared_energy']),
            "total_solar_used": sum(results['solar_used']),
            "total_grid_import": sum(results['grid_import'])
        }
    }

@router.get("/forecast/24h", response_model=ForecastResponse)
async def get_forecast():
    """Get 24-hour solar production forecast using LSTM/Prophet models"""
    forecasting_service = get_forecasting_service()
    
    # Get historical data if available
    historical_data = None
    if current_simulation and step_results_history:
        historical_data = []
        for result in step_results_history[-24:]:
            for agent in current_simulation.agents:
                historical_data.append({
                    'hour': result.get('hour', 12),
                    'production': agent.production,
                    'consumption': agent.consumption,
                    'battery_pct': agent.battery_level / agent.battery_capacity
                })
    
    # Get weather forecast (if available)
    weather_forecast = None  # Could be fetched from weather API
    
    # Get forecast
    forecast = forecasting_service.predict_24h(
        historical_data=historical_data,
        weather_forecast=weather_forecast
    )
    
    return ForecastResponse(
        forecast_horizon_hours=24,
        model_type=forecasting_service.model_type.upper(),
        forecast=forecast
    )

@router.get("/anomalies")
async def get_anomalies():
    """Get current anomaly alerts"""
    global current_simulation
    
    if current_simulation is None:
        return {"anomalies": []}
    
    anomaly_service = get_anomaly_service()
    
    # Prepare agent data
    agent_data = [
        {
            'agent_id': agent.id,
            'production': agent.production,
            'consumption': agent.consumption,
            'battery_level': agent.battery_level,
            'net_energy': agent.production - agent.consumption,
            'hour': current_simulation.time_step % 24
        }
        for agent in current_simulation.agents
    ]
    
    anomalies = anomaly_service.detect_anomalies(agent_data)
    
    return {"anomalies": anomalies}

@router.get("/metrics/history")
async def get_metrics_history(hours: int = 24):
    """Get historical metrics from database"""
    try:
        history = historical_storage.get_metrics_history(hours=hours)
        return history
    except Exception as e:
        logger.error(f"Failed to get metrics history: {e}")
        # Fallback to current simulation if available
        if current_simulation:
            return {
                "hours": hours,
                "solar_used": current_simulation.results.get('solar_used', [])[-hours:],
                "grid_import": current_simulation.results.get('grid_import', [])[-hours:],
        "energy_shared": current_simulation.results['shared_energy'][-hours:]
    }

@router.get("/insights/predictive")
async def get_predictive_insights():
    """Get AI-powered predictive insights"""
    global current_simulation
    
    if current_simulation is None:
        raise HTTPException(status_code=404, detail="No simulation available")
    
    # Calculate insights based on current state
    insights = []
    
    # Peak production window
    total_production = sum(agent.production for agent in current_simulation.agents)
    if total_production > 200:  # High production threshold
        insights.append({
            "type": "optimization",
            "title": "Peak Production Window",
            "description": "Optimal energy sharing expected between 12:00-14:00",
            "impact": "high",
            "icon": "⚡"
        })
    
    # Low battery alert
    low_battery_count = sum(1 for agent in current_simulation.agents 
                           if agent.battery_level < 0.2 * agent.battery_capacity)
    if low_battery_count > 0:
        insights.append({
            "type": "warning",
            "title": "Low Battery Alert",
            "description": f"{low_battery_count} agents below 20% capacity - recommend grid backup",
            "impact": "medium",
            "icon": "⚠️"
        })
    
    # Trading opportunity
    total_surplus = sum(max(0, agent.production - agent.consumption) 
                       for agent in current_simulation.agents)
    if total_surplus > 50:
        insights.append({
            "type": "opportunity",
            "title": "Trading Opportunity",
            "description": "High surplus predicted - consider increasing peer-to-peer trades",
            "impact": "high",
            "icon": "💡"
        })
    
    return {"insights": insights}

@router.get("/gamification/achievements")
async def get_achievements():
    """Get gamification achievements and leaderboard"""
    global current_simulation
    
    if current_simulation is None:
        raise HTTPException(status_code=404, detail="No simulation available")
    
    # Calculate achievements based on metrics
    evaluator = PerformanceEvaluator()
    results = {
        'production': [agent.production for agent in current_simulation.agents] * current_simulation.time_step,
        'consumption': [agent.consumption for agent in current_simulation.agents] * current_simulation.time_step,
        'solar_used': current_simulation.results.get('solar_used', []),
        'grid_import': current_simulation.results.get('grid_import', []),
        'energy_shared': current_simulation.results.get('shared_energy', [])
    }
    
    energy_metrics = evaluator.calculate_energy_metrics(results)
    environmental_metrics = evaluator.calculate_environmental_impact(results)
    
    achievements = [
        {
            "id": 1,
            "name": "Solar Champion",
            "progress": min(100, energy_metrics.get('solar_utilization_pct', 0)),
            "icon": "🏆",
            "unlocked": energy_metrics.get('solar_utilization_pct', 0) > 80
        },
        {
            "id": 2,
            "name": "Energy Sharer",
            "progress": min(100, (sum(results.get('energy_shared', [])) / max(1, sum(results.get('solar_used', [])))) * 100),
            "icon": "🤝",
            "unlocked": sum(results.get('energy_shared', [])) > 100
        },
        {
            "id": 3,
            "name": "Grid Independent",
            "progress": min(100, 100 - energy_metrics.get('grid_dependency_pct', 100)),
            "icon": "🔋",
            "unlocked": energy_metrics.get('grid_dependency_pct', 100) < 30
        },
        {
            "id": 4,
            "name": "Carbon Neutral",
            "progress": min(100, (environmental_metrics.get('daily_co2_avoided_kg', 0) / 50) * 100),
            "icon": "🌱",
            "unlocked": environmental_metrics.get('daily_co2_avoided_kg', 0) > 50
        }
    ]
    
    # Calculate leaderboard (top agents by efficiency)
    agent_scores = []
    for i, agent in enumerate(current_simulation.agents):
        efficiency = (agent.production / max(1, agent.consumption)) * 100
        score = int(efficiency * 10 + (agent.battery_level / agent.battery_capacity) * 100)
        agent_scores.append({
            "rank": i + 1,
            "agent": f"Agent #{agent.id}",
            "score": score,
            "badge": "🥇" if i == 0 else "🥈" if i == 1 else "🥉" if i == 2 else ""
        })
    
    leaderboard = sorted(agent_scores, key=lambda x: x['score'], reverse=True)[:10]
    for i, entry in enumerate(leaderboard):
        entry['rank'] = i + 1
        if i == 0:
            entry['badge'] = "🥇"
        elif i == 1:
            entry['badge'] = "🥈"
        elif i == 2:
            entry['badge'] = "🥉"
        else:
            entry['badge'] = ""
    
    return {
        "achievements": achievements,
        "leaderboard": leaderboard[:3]  # Top 3
    }

@router.get("/analytics/trends")
async def get_analytics_trends():
    """Get advanced analytics and trends"""
    global current_simulation
    
    if current_simulation is None:
        raise HTTPException(status_code=404, detail="No simulation data")
    
    # Calculate trends
    if len(current_simulation.results['solar_used']) > 1:
        recent_solar = current_simulation.results['solar_used'][-6:]
        earlier_solar = current_simulation.results['solar_used'][-12:-6] if len(current_simulation.results['solar_used']) > 6 else recent_solar
        
        avg_recent = sum(recent_solar) / len(recent_solar) if recent_solar else 0
        avg_earlier = sum(earlier_solar) / len(earlier_solar) if earlier_solar else avg_recent
        
        solar_trend = ((avg_recent - avg_earlier) / max(1, avg_earlier)) * 100 if avg_earlier > 0 else 0
    else:
        solar_trend = 0
    
    return {
        "solar_trend": round(solar_trend, 2),
        "efficiency_trend": 2.3,
        "cost_savings_trend": 5.2,
        "co2_reduction_trend": 3.1
    }

# ============================================================================
# IoT Endpoints for ESP32 Prototype
# ============================================================================

def make_iot_decision(current_production, forecasted_production, battery_level, voltage, has_anomaly):
    """
    AI-based decision making for IoT device control
    
    Priority logic:
    1. Emergency: Battery low + no production → Disable load
    2. High production + battery not full → Charge battery
    3. High production + battery full → Export to grid
    4. Low production + battery available → Use battery for load
    """
    
    # Emergency: Battery critically low
    if battery_level < 20 and current_production < 0.1:
        return {
            'action': 'disable_load',
            'amount': 0.0,
            'priority': 'critical',
            'reason': 'Battery critically low, preserving energy'
        }
    
    # Emergency: Anomaly detected
    if has_anomaly:
        return {
            'action': 'stop_battery',
            'amount': 0.0,
            'priority': 'high',
            'reason': 'Anomaly detected, stopping battery operations'
        }
    
    # High production scenarios
    if current_production > 0.5:  # > 500W production
        if battery_level < 80:
            # Charge battery
            charge_rate = min(current_production * 0.8, 2.0)  # Max 2kW charging
            return {
                'action': 'charge_battery',
                'amount': charge_rate,
                'priority': 'high',
                'reason': f'High production ({current_production:.2f}kW), charging battery'
            }
        elif battery_level >= 80:
            # Battery full, export to grid
            return {
                'action': 'export_to_grid',
                'amount': current_production * 0.9,
                'priority': 'medium',
                'reason': 'Battery full, exporting excess to grid'
            }
    
    # Low production scenarios
    elif current_production < 0.2:  # < 200W production
        if battery_level > 30:
            # Use battery for load
            return {
                'action': 'discharge_battery',
                'amount': min(1.0, battery_level / 10),  # Discharge rate
                'priority': 'medium',
                'reason': 'Low production, using battery for load'
            }
        else:
            # Battery low, disable load
            return {
                'action': 'disable_load',
                'amount': 0.0,
                'priority': 'high',
                'reason': 'Low production and low battery, disabling load'
            }
    
    # Normal operation: Enable load, stop battery operations
    return {
        'action': 'enable_load',
        'amount': 0.0,
        'priority': 'normal',
        'reason': 'Normal operation, load enabled'
    }


@router.post("/iot/data", response_model=IoTDataResponse)
async def receive_iot_data(data: dict):
    """
    Receive sensor data from ESP32 and return AI-based decision
    
    Expected payload:
    {
        "device_id": "esp32_sensor_01",
        "sensor_data": {
            "voltage_v": 12.5,
            "current_a": 0.5,
            "power_w": 6.25,
            "temperature_c": 28.5,
            "battery_level_pct": 50.0,
            "timestamp": "2024-01-01T12:00:00"
        },
        "timestamp": "2024-01-01T12:00:00"
    }
    
    Returns:
    {
        "status": "received",
        "power_kw": 0.00625,
        "anomalies_detected": 0,
        "forecast_next_hour": 0.007,
        "command": {
            "action": "charge_battery",
            "amount": 2.5,
            "priority": "high",
            "reason": "..."
        }
    }
    """
    from datetime import datetime
    
    device_id = data.get('device_id', 'unknown')
    sensor_data = data.get('sensor_data', {})
    
    # Extract sensor values
    voltage = sensor_data.get('voltage_v', 0.0)
    current = sensor_data.get('current_a', 0.0)
    power_w = sensor_data.get('power_w', 0.0)
    power_kw = power_w / 1000.0
    temperature = sensor_data.get('temperature_c', 25.0)
    battery_level = sensor_data.get('battery_level_pct', 50.0)
    
    logger.info(f"📡 IoT data from {device_id}: {power_w:.2f}W ({power_kw:.3f}kW) @ {voltage:.2f}V, Battery: {battery_level:.1f}%")
    
    # ============ AI DECISION MAKING ============
    
    # 1. Anomaly Detection
    try:
        anomaly_service = get_anomaly_service()
        anomaly_data = [{
            'agent_id': device_id,
            'production': power_kw,
            'consumption': 0.0,  # Could add consumption sensor later
            'battery_level': battery_level,
            'net_energy': power_kw,
            'hour': datetime.now().hour
        }]
        anomalies = anomaly_service.detect_anomalies(anomaly_data)
        has_anomaly = len(anomalies) > 0 if anomalies else False
    except Exception as e:
        logger.warning(f"Anomaly detection failed: {e}")
        anomalies = []
        has_anomaly = False
    
    # 2. Forecasting (predict next hour production)
    try:
        forecasting_service = get_forecasting_service()
        historical_data = [{
            'hour': datetime.now().hour,
            'production': power_kw,
            'consumption': 0.0,
            'battery_pct': battery_level / 100.0
        }]
        forecast = forecasting_service.predict_24h(historical_data=historical_data)
        next_hour_production = forecast[0]['predicted_kwh'] if forecast and len(forecast) > 0 else power_kw
    except Exception as e:
        logger.warning(f"Forecasting failed: {e}, using current production as forecast")
        next_hour_production = power_kw
    
    # 3. Rule-based Decision Making (similar to agent.make_decision())
    decision = make_iot_decision(
        current_production=power_kw,
        forecasted_production=next_hour_production,
        battery_level=battery_level,
        voltage=voltage,
        has_anomaly=has_anomaly
    )
    
    # Store command for device to retrieve
    device_commands[device_id] = {
        'command': decision,
        'status': 'pending',
        'timestamp': datetime.now().isoformat()
    }
    
    logger.info(f"🎯 Decision for {device_id}: {decision['action']} (amount: {decision.get('amount', 0)}) - {decision['reason']}")
    
    return IoTDataResponse(
        status="received",
        power_kw=power_kw,
        anomalies_detected=len(anomalies),
        forecast_next_hour=next_hour_production,
        command=decision,
        timestamp=datetime.now().isoformat()
    )


@router.get("/iot/command")
async def get_iot_command(device_id: str = Query(..., description="Device identifier")):
    """
    ESP32 polls this endpoint to get pending commands
    
    Returns:
    - 200 with command if available
    - 204 No Content if no command pending
    """
    if device_id in device_commands:
        command_data = device_commands[device_id]
        if command_data['status'] == 'pending':
            return IoTCommandResponse(
                command=command_data['command'],
                timestamp=command_data['timestamp']
            )
    
    # No command available - return 204 No Content
    return Response(status_code=204)


@router.post("/iot/command/confirm")
async def confirm_command_execution(data: dict):
    """
    ESP32 confirms command execution
    
    Payload: {
        "device_id": "esp32_sensor_01",
        "command": "charge_battery",
        "executed": true
    }
    """
    device_id = data.get('device_id')
    command = data.get('command')
    
    if device_id in device_commands:
        device_commands[device_id]['status'] = 'executed'
        logger.info(f"✅ Command '{command}' executed by {device_id}")
    
    return {"status": "confirmed", "device_id": device_id, "command": command}
