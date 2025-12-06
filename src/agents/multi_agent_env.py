"""
Multi-Agent Environment
Gym-compatible environment for multi-agent reinforcement learning
"""

import gym
from gym import spaces
import numpy as np
from typing import List, Dict, Tuple


class MultiAgentSolarEnv(gym.Env):
    """
    Multi-agent environment where each agent controls a solar panel system
    """
    
    metadata = {'render.modes': ['human', 'rgb_array']}
    
    def __init__(self, num_agents=50, grid_size=(10, 5)):
        super(MultiAgentSolarEnv, self).__init__()
        
        self.num_agents = num_agents
        self.grid_size = grid_size
        self.current_step = 0
        self.max_steps = 24 * 90  # 90 days
        
        # Agent positions in grid
        self.agent_positions = self._create_grid_positions()
        
        # Observation space for each agent
        # [battery_level, production, consumption, hour, neighbors_avg_battery, 
        #  neighbors_avg_excess, temperature, cloud_cover]
        self.observation_space = spaces.Box(
            low=np.array([0, 0, 0, 0, 0, -10, 0, 0]),
            high=np.array([100, 10, 10, 23, 100, 10, 50, 100]),
            dtype=np.float32
        )
        
        # Action space for each agent
        # [battery_charge_rate, share_amount, sell_to_grid_amount]
        self.action_space = spaces.Box(
            low=np.array([0, 0, 0]),
            high=np.array([1, 10, 10]),
            dtype=np.float32
        )
        
        # Initialize agent states
        self.reset()
    
    def _create_grid_positions(self):
        """Create grid positions for agents"""
        positions = []
        rows, cols = self.grid_size
        for i in range(self.num_agents):
            row = i // cols
            col = i % cols
            positions.append((row, col))
        return positions
    
    def _get_neighbors(self, agent_id, radius=1):
        """Get neighboring agents within radius"""
        pos = self.agent_positions[agent_id]
        neighbors = []
        
        for other_id, other_pos in enumerate(self.agent_positions):
            if other_id == agent_id:
                continue
            
            # Manhattan distance
            dist = abs(pos[0] - other_pos[0]) + abs(pos[1] - other_pos[1])
            if dist <= radius:
                neighbors.append(other_id)
        
        return neighbors
    
    def reset(self):
        """Reset environment to initial state"""
        self.current_step = 0
        
        # Initialize agent states
        self.agent_states = []
        for i in range(self.num_agents):
            state = {
                'battery_level': 50.0,  # 50% charge
                'battery_capacity': 10.0,  # 10 kWh
                'production': 0.0,
                'consumption': 0.0,
                'neighbors': self._get_neighbors(i)
            }
            self.agent_states.append(state)
        
        return self._get_observations()
    
    def _get_observations(self):
        """Get observations for all agents"""
        observations = []
        hour = self.current_step % 24
        
        for i, state in enumerate(self.agent_states):
            # Get neighbor statistics
            neighbors = state['neighbors']
            if neighbors:
                neighbor_batteries = [self.agent_states[n]['battery_level'] for n in neighbors]
                neighbor_excess = [
                    max(0, self.agent_states[n]['production'] - self.agent_states[n]['consumption'])
                    for n in neighbors
                ]
                avg_neighbor_battery = np.mean(neighbor_batteries)
                avg_neighbor_excess = np.mean(neighbor_excess)
            else:
                avg_neighbor_battery = 50.0
                avg_neighbor_excess = 0.0
            
            # Simulate weather
            temperature = 20 + 10 * np.sin((self.current_step / 24) * 2 * np.pi / 365)
            cloud_cover = np.random.beta(2, 5) * 100
            
            obs = np.array([
                state['battery_level'],
                state['production'],
                state['consumption'],
                hour,
                avg_neighbor_battery,
                avg_neighbor_excess,
                temperature,
                cloud_cover
            ], dtype=np.float32)
            
            observations.append(obs)
        
        return observations
    
    def _simulate_production(self, hour):
        """Simulate solar production"""
        if 6 <= hour <= 18:
            base = 5 * np.sin((hour - 6) * np.pi / 12)
            return max(0, base + np.random.normal(0, 0.3))
        return 0.0
    
    def _simulate_consumption(self, hour):
        """Simulate consumption"""
        if 6 <= hour <= 9 or 18 <= hour <= 22:
            return np.random.uniform(2, 4)
        elif 9 < hour < 18:
            return np.random.uniform(1, 2)
        return np.random.uniform(0.5, 1)
    
    def step(self, actions):
        """
        Execute one step with actions from all agents
        
        Args:
            actions: List of actions, one per agent
        
        Returns:
            observations, rewards, dones, info
        """
        hour = self.current_step % 24
        rewards = []
        
        # Update production and consumption
        for state in self.agent_states:
            state['production'] = self._simulate_production(hour)
            state['consumption'] = self._simulate_consumption(hour)
        
        # Process actions for each agent
        for i, (state, action) in enumerate(zip(self.agent_states, actions)):
            charge_rate, share_amount, sell_amount = action
            
            net_energy = state['production'] - state['consumption']
            reward = 0
            
            # Battery charging
            if charge_rate > 0 and net_energy > 0:
                charge = min(
                    net_energy * charge_rate,
                    state['battery_capacity'] - state['battery_level']
                )
                state['battery_level'] += charge
                reward += charge * 2  # Reward for storing solar
                net_energy -= charge
            
            # Energy sharing
            if share_amount > 0 and net_energy > 0:
                shared = min(share_amount, net_energy)
                reward += shared * 3  # Higher reward for sharing
                net_energy -= shared
            
            # Sell to grid
            if sell_amount > 0 and net_energy > 0:
                sold = min(sell_amount, net_energy)
                reward += sold * 1  # Lower reward
                net_energy -= sold
            
            # Penalties
            if state['consumption'] > state['production']:
                deficit = state['consumption'] - state['production']
                if state['battery_level'] >= deficit:
                    state['battery_level'] -= deficit
                else:
                    grid_import = deficit - state['battery_level']
                    state['battery_level'] = 0
                    reward -= grid_import * 5  # Penalty for grid import
            
            if state['battery_level'] < 0.2 * state['battery_capacity']:
                reward -= 10  # Low battery penalty
            
            rewards.append(reward)
        
        self.current_step += 1
        done = self.current_step >= self.max_steps
        dones = [done] * self.num_agents
        
        observations = self._get_observations()
        info = {'step': self.current_step}
        
        return observations, rewards, dones, info
    
    def render(self, mode='human'):
        """Render the environment"""
        if mode == 'human':
            print(f"\n=== Step {self.current_step} ===")
            print(f"Hour: {self.current_step % 24}")
            
            total_production = sum(s['production'] for s in self.agent_states)
            total_consumption = sum(s['consumption'] for s in self.agent_states)
            avg_battery = np.mean([s['battery_level'] for s in self.agent_states])
            
            print(f"Total Production: {total_production:.2f} kWh")
            print(f"Total Consumption: {total_consumption:.2f} kWh")
            print(f"Average Battery: {avg_battery:.1f}%")
    
    def close(self):
        """Clean up resources"""
        pass


# Usage example
if __name__ == "__main__":
    env = MultiAgentSolarEnv(num_agents=10)
    obs = env.reset()
    
    print(f"Environment created with {env.num_agents} agents")
    print(f"Observation space: {env.observation_space}")
    print(f"Action space: {env.action_space}")
    
    # Run a few steps
    for step in range(5):
        actions = [env.action_space.sample() for _ in range(env.num_agents)]
        obs, rewards, dones, info = env.step(actions)
        env.render()
        
        if dones[0]:
            break
    
    env.close()
