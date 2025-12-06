# Solar Swarm Intelligence - Implementation Plan

## 🎯 Project Understanding

### Core Concept
You're building a **multi-agent reinforcement learning system** where:
- **50+ solar homes** form a community network
- Each home is an **intelligent agent** that:
  - Generates solar energy
  - Consumes energy based on patterns
  - Stores energy in batteries
  - **Shares excess energy** with neighbors (P2P)
  - Makes decisions using RL/rule-based logic
- **Goal**: Maximize solar utilization, reduce grid dependency, save costs, reduce CO₂

### Architecture
```
Frontend (React Dashboard) 
    ↕ WebSocket + REST API
Backend (FastAPI)
    ↕
Simulation Engine (SwarmSimulator)
    ↕
Agents (SolarPanelAgent) → Decisions → Energy Sharing
```

---

## 🔍 Current State Analysis

### ✅ What's Working
1. ✅ Backend API structure (FastAPI)
2. ✅ Frontend dashboard components (all built)
3. ✅ Agent logic (rule-based decision making)
4. ✅ Simulation engine (SwarmSimulator)
5. ✅ Metrics calculation
6. ✅ WebSocket infrastructure (exists but not connected)

### ❌ Critical Issues

#### 1. **Simulation Runs Too Fast (No Real-Time Updates)**
- Problem: `run_simulation_background()` executes all 24 hours instantly
- Impact: Frontend never sees updates during simulation
- Location: `src/api/routes.py:74-84`

#### 2. **WebSocket Not Broadcasting During Simulation**
- Problem: WebSocket manager exists but simulation doesn't use it
- Impact: No real-time updates to frontend
- Location: `src/api/websocket.py` exists but not integrated

#### 3. **Missing Step-by-Step Execution**
- Problem: `SwarmSimulator.run()` runs all hours at once
- Need: `step()` method that runs one hour and returns state
- Location: `src/agents/base_agent.py:205-223`

#### 4. **Energy Flows Not Tracked**
- Problem: Energy sharing happens but flows aren't recorded
- Impact: Frontend map can't show energy transfers
- Location: `src/agents/base_agent.py:189-193`

#### 5. **Data Format Mismatch**
- Problem: Frontend expects `energy_flows` array, backend doesn't provide it
- Impact: Map visualization doesn't work
- Location: Frontend expects `{from, to, amount}`, backend doesn't track this

#### 6. **Simulation State Not Accessible During Execution**
- Problem: Simulation runs in background, state not queryable
- Impact: Can't get current agents/metrics while running

---

## 🛠️ Implementation Steps

### **STEP 1: Add Step-by-Step Simulation** ⚡ CRITICAL

**File**: `src/agents/base_agent.py`

Add a `step()` method to `SwarmSimulator`:

```python
def step(self, hour):
    """Run one simulation timestep and return state"""
    self.run_timestep(hour)
    self.time_step += 1
    
    # Track energy flows
    energy_flows = []
    for agent in self.agents:
        decision = agent.make_decision()
        if decision.get('action') == 'share_energy':
            energy_flows.append({
                'from': agent.id,
                'to': decision.get('target'),
                'amount': decision.get('amount', 0)
            })
    
    # Calculate metrics for this step
    total_solar = sum(min(a.production, a.consumption) for a in self.agents)
    total_grid = sum(max(0, a.consumption - a.production) for a in self.agents)
    total_shared = sum(f['amount'] for f in energy_flows)
    
    return {
        'hour': hour,
        'energy_flows': energy_flows,
        'solar_usage_pct': (total_solar / sum(a.production for a in self.agents) * 100) if sum(a.production for a in self.agents) > 0 else 0,
        'avg_battery': sum(a.battery_level / a.battery_capacity for a in self.agents) / len(self.agents) * 100,
        'cost_savings': total_shared * 0.12,  # Peer trade price
        'co2_saved': total_shared * 0.5,  # CO2 intensity
        'agent_decisions': [agent.make_decision() for agent in self.agents]
    }
```

### **STEP 2: Integrate WebSocket Broadcasting** ⚡ CRITICAL

**File**: `src/api/routes.py`

Modify `run_simulation_background()` to broadcast updates:

```python
async def run_simulation_background(hours: int):
    """Run simulation step-by-step with WebSocket updates"""
    global current_simulation, simulation_running
    from ..api.main import ws_manager
    
    try:
        for hour in range(hours):
            if not simulation_running:
                break
                
            # Run one step
            step_result = current_simulation.step(hour)
            
            # Prepare WebSocket update
            update = {
                'timestamp': hour,
                'houses': [
                    {
                        'id': agent.id,
                        'production': agent.production,
                        'consumption': agent.consumption,
                        'battery': agent.battery_level,
                        'battery_capacity': agent.battery_capacity,
                        'status': 'surplus' if agent.production > agent.consumption else 'deficit'
                    }
                    for agent in current_simulation.agents
                ],
                'energy_flows': step_result['energy_flows'],
                'metrics': {
                    'solarUsage': step_result['solar_usage_pct'],
                    'batteryLevel': step_result['avg_battery'],
                    'costSavings': step_result['cost_savings'],
                    'co2Saved': step_result['co2_saved']
                },
                'agentMessages': step_result['agent_decisions']
            }
            
            # Broadcast to all connected clients
            await ws_manager.broadcast(update)
            
            # Wait before next step (simulate real-time)
            await asyncio.sleep(2)  # 2 seconds per hour = 48 seconds for 24 hours
            
        logger.info(f"Simulation completed")
    except Exception as e:
        logger.error(f"Simulation error: {e}")
    finally:
        simulation_running = False
```

### **STEP 3: Fix Energy Flow Tracking** ⚡ CRITICAL

**File**: `src/agents/base_agent.py`

Modify `make_decision()` to return flow information:

```python
def make_decision(self):
    """Rule-based decision making - returns decision with flow info"""
    # ... existing logic ...
    
    # When sharing, return target and amount
    if decision['action'] == 'share_energy':
        return {
            'action': 'share_energy',
            'target': decision['target'],
            'amount': decision['amount'],
            'from': self.id
        }
    
    return decision
```

### **STEP 4: Fix Frontend WebSocket Handler** 

**File**: `frontend/src/App.jsx`

Update WebSocket message handler:

```javascript
ws = connectWS((data) => {
  // Handle real-time updates
  if (data.houses) {
    setAgents(data.houses.map(h => ({
      id: h.id,
      production: h.production,
      consumption: h.consumption,
      battery_level: h.battery,
      battery_capacity: h.battery_capacity || 10,
      status: h.status
    })))
  }
  if (data.energy_flows) {
    setEnergyFlows(data.energy_flows.map(f => ({
      from: f.from,
      to: f.to,
      amount: f.amount
    })))
  }
  if (data.metrics) {
    setMetrics({
      solar_utilization_pct: data.metrics.solarUsage,
      self_sufficiency_pct: data.metrics.batteryLevel,
      cost_savings_daily: data.metrics.costSavings,
      co2_avoided_kg: data.metrics.co2Saved
    })
  }
})
```

### **STEP 5: Add Periodic Status Updates**

**File**: `src/api/routes.py`

Add background task to send periodic status:

```python
async def send_periodic_updates():
    """Send periodic status updates via WebSocket"""
    global current_simulation, simulation_running
    from ..api.main import ws_manager
    
    while True:
        await asyncio.sleep(5)  # Every 5 seconds
        
        if current_simulation and simulation_running:
            # Send current state
            update = {
                'status': 'running',
                'current_hour': current_simulation.time_step,
                'agents': [
                    {
                        'id': agent.id,
                        'production': agent.production,
                        'consumption': agent.consumption,
                        'battery_level': agent.battery_level,
                        'status': 'surplus' if agent.production > agent.consumption else 'deficit'
                    }
                    for agent in current_simulation.agents
                ]
            }
            await ws_manager.broadcast(update)
```

---

## 📋 Complete Action Checklist

### Phase 1: Core Functionality (Do First)
- [ ] Add `step()` method to `SwarmSimulator`
- [ ] Modify `run_simulation_background()` to run step-by-step
- [ ] Integrate WebSocket broadcasting in simulation loop
- [ ] Track energy flows during simulation
- [ ] Fix frontend WebSocket message handler

### Phase 2: Data Flow
- [ ] Ensure agent data format matches frontend expectations
- [ ] Add energy flow tracking to decision making
- [ ] Calculate metrics per step (not just at end)
- [ ] Fix metrics endpoint to work during simulation

### Phase 3: Real-Time Features
- [ ] Add periodic status updates (every 5 seconds)
- [ ] Make simulation pausable/resumable
- [ ] Add simulation speed control
- [ ] Handle WebSocket reconnection

### Phase 4: Polish
- [ ] Add error handling for WebSocket failures
- [ ] Add simulation progress indicator
- [ ] Optimize performance for 50+ agents
- [ ] Add logging for debugging

---

## 🚀 Quick Start Fix

**To make it work immediately, do these 3 things:**

1. **Add `step()` method** to `SwarmSimulator` (see Step 1)
2. **Modify `run_simulation_background()`** to use step-by-step execution (see Step 2)
3. **Fix frontend WebSocket handler** to parse the correct data format (see Step 4)

This will enable:
- ✅ Real-time simulation updates
- ✅ Live map visualization
- ✅ Energy flow animations
- ✅ Real-time metrics updates

---

## 🧪 Testing Steps

1. Start backend: `python main.py api`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:3000`
4. Click "Start Simulation"
5. **Verify**:
   - Map shows houses updating in real-time
   - Energy flows appear between houses
   - Metrics update every 2 seconds
   - Progress shows current hour

---

## 📝 Notes

- Simulation speed: 2 seconds per hour = 48 seconds for full 24h simulation
- WebSocket updates: Sent after each hour step
- Energy flows: Tracked when agents share energy
- Metrics: Calculated per step, not just at end

