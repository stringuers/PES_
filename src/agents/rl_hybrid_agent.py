"""
Hybrid Agent that can use either rule-based or RL-based decision making
"""
import numpy as np
import os
from .base_agent import SolarPanelAgent
from .ppo_agent import PPOAgent

class HybridRLAgent(SolarPanelAgent):
    """
    Agent that can use RL for decision making when model is available
    Falls back to rule-based when RL model is not loaded
    """
    
    def __init__(self, agent_id, battery_capacity=10, use_rl=False, rl_model_path=None):
        super().__init__(agent_id, battery_capacity)
        self.use_rl = use_rl
        self.rl_agent = None
        
        if use_rl and rl_model_path and os.path.exists(rl_model_path):
            try:
                # State: [battery_pct, production, consumption, hour/24, neighbor_avg_battery]
                state_dim = 5
                action_dim = 3  # [charge_pct, share_amount, sell_amount]
                
                self.rl_agent = PPOAgent(state_dim, action_dim)
                self.rl_agent.load(rl_model_path)
                self.use_rl = True
            except Exception as e:
                print(f"Warning: Could not load RL model for agent {agent_id}: {e}")
                self.use_rl = False
    
    def get_state_vector(self):
        """Get state vector for RL agent"""
        neighbor_battery_avg = 0.5
        if self.neighbors:
            neighbor_battery_avg = np.mean([
                n.battery_level / n.battery_capacity 
                for n in self.neighbors
            ])
        
        # Normalize values
        state = np.array([
            self.battery_level / self.battery_capacity,  # 0-1
            min(self.production / 10.0, 1.0),  # Normalized production
            min(self.consumption / 10.0, 1.0),  # Normalized consumption
            0.5,  # Hour (would be passed in make_decision)
            neighbor_battery_avg  # 0-1
        ], dtype=np.float32)
        
        return state
    
    def make_decision(self, hour=12):
        """
        Make decision using RL if available, otherwise use rule-based
        """
        if self.use_rl and self.rl_agent:
            try:
                state = self.get_state_vector()
                # Update hour in state
                state[3] = hour / 24.0
                
                # Get action from RL agent
                action, _ = self.rl_agent.select_action(state)
                
                # Parse action: [charge_pct, share_amount, sell_amount]
                charge_pct = np.clip(action[0], 0, 1)
                share_amount = max(0, action[1])
                sell_amount = max(0, action[2])
                
                # Calculate net energy
                net_energy = self.production - self.consumption
                
                # Apply RL decision
                if net_energy > 0:
                    # Charge battery
                    if charge_pct > 0.1:
                        charge = min(net_energy * charge_pct, 
                                   self.battery_capacity - self.battery_level)
                        self.battery_level += charge
                        net_energy -= charge
                    
                    # Share with neighbors
                    if share_amount > 0.5 and net_energy > 0:
                        for neighbor in self.neighbors:
                            if neighbor.calculate_needs() > 0:
                                share = min(share_amount, net_energy, neighbor.calculate_needs())
                                return {
                                    'action': 'share_energy',
                                    'target': neighbor.id,
                                    'amount': share,
                                    'method': 'rl'
                                }
                    
                    # Sell to grid
                    if sell_amount > 0.5 and net_energy > 0:
                        return {
                            'action': 'sell_to_grid',
                            'amount': min(sell_amount, net_energy),
                            'method': 'rl'
                        }
                    
                    # Store remaining
                    if self.battery_level < 0.9 * self.battery_capacity:
                        charge = min(net_energy, 
                                    (0.9 * self.battery_capacity) - self.battery_level)
                        self.battery_level += charge
                        return {'action': 'charge_battery', 'amount': charge, 'method': 'rl'}
                
                # Handle deficit
                if net_energy < 0:
                    needs = abs(net_energy)
                    if self.battery_level > 0:
                        use_battery = min(needs, self.battery_level)
                        self.battery_level -= use_battery
                        needs -= use_battery
                    
                    if needs > 0:
                        return {'action': 'request_energy', 'amount': needs, 'method': 'rl'}
                
                return {'action': 'idle', 'amount': 0, 'method': 'rl'}
                
            except Exception as e:
                print(f"RL decision failed for agent {self.id}, falling back to rule-based: {e}")
                # Fall through to rule-based
        
        # Fallback to rule-based decision
        decision = super().make_decision()
        decision['method'] = 'rule-based'
        return decision

