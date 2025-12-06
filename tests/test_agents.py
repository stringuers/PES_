"""
Test Agents Module
"""

import pytest
import numpy as np
from src.agents.base_agent import SolarPanelAgent, SwarmSimulator
from src.agents.communication import CommunicationProtocol, EnergyNegotiator


class TestSolarPanelAgent:
    """Test SolarPanelAgent class"""
    
    def test_agent_initialization(self):
        """Test agent creation"""
        agent = SolarPanelAgent(agent_id=0, battery_capacity=10)
        
        assert agent.id == 0
        assert agent.battery_capacity == 10
        assert agent.battery_level == 5.0  # 50% initial
    
    def test_calculate_excess(self):
        """Test excess energy calculation"""
        agent = SolarPanelAgent(agent_id=0)
        agent.production = 5.0
        agent.consumption = 2.0
        agent.battery_level = 8.0  # 80%
        
        excess = agent.calculate_excess()
        assert excess == 3.0
    
    def test_calculate_needs(self):
        """Test energy needs calculation"""
        agent = SolarPanelAgent(agent_id=0)
        agent.production = 2.0
        agent.consumption = 5.0
        
        needs = agent.calculate_needs()
        assert needs == 3.0
    
    def test_make_decision(self):
        """Test decision making"""
        agent = SolarPanelAgent(agent_id=0)
        agent.production = 5.0
        agent.consumption = 2.0
        agent.battery_level = 3.0
        
        decision = agent.make_decision()
        assert 'action' in decision
        assert decision['action'] in ['charge_battery', 'share_energy', 'sell_to_grid', 'request_energy']


class TestSwarmSimulator:
    """Test SwarmSimulator class"""
    
    def test_simulator_initialization(self):
        """Test simulator creation"""
        sim = SwarmSimulator(num_agents=10)
        
        assert len(sim.agents) == 10
        assert all(len(agent.neighbors) > 0 for agent in sim.agents)
    
    def test_simulation_run(self):
        """Test simulation execution"""
        sim = SwarmSimulator(num_agents=5)
        results = sim.run(hours=2)
        
        assert 'solar_used' in results
        assert 'grid_import' in results
        assert len(results['solar_used']) == 2


class TestCommunication:
    """Test communication protocols"""
    
    def test_message_sending(self):
        """Test message sending"""
        from src.agents.communication import Message
        from datetime import datetime
        
        protocol = CommunicationProtocol()
        
        msg = Message(
            sender_id=0,
            receiver_id=1,
            message_type='request',
            content={'energy': 2.0},
            timestamp=datetime.now().timestamp()
        )
        
        protocol.send_message(msg)
        messages = protocol.get_messages_for_agent(1)
        
        assert len(messages) == 1
        assert messages[0].sender_id == 0
    
    def test_energy_negotiation(self):
        """Test energy trading"""
        negotiator = EnergyNegotiator()
        
        offer_id = negotiator.create_offer(seller_id=0, energy_kwh=3.0, price_per_kwh=0.12)
        success = negotiator.accept_offer(offer_id, buyer_id=1, amount_kwh=2.0)
        
        assert success
        assert len(negotiator.completed_trades) == 1
        assert negotiator.completed_trades[0]['energy_kwh'] == 2.0


def test_import():
    """Test module imports"""
    from src.agents import SolarPanelAgent, SwarmSimulator
    assert SolarPanelAgent is not None
    assert SwarmSimulator is not None
