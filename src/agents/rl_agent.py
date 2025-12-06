import numpy as np
import torch
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
import gym
from gym import spaces

class SolarSwarmEnv(gym.Env):
    """
    Custom Gym environment for solar swarm RL training
    """
    
    def __init__(self, num_agents=50):
        super(SolarSwarmEnv, self).__init__()
        
        self.num_agents = num_agents
        self.current_agent = 0
        
        # Observation space: [battery, production, consumption, forecast, neighbor_states]
        self.observation_space = spaces.Box(
            low=0, high=100,
            shape=(10,),  # Adjust based on state size
            dtype=np.float32
        )
        
        # Action space: [charge_battery, share_amount, sell_amount]
        self.action_space = spaces.Box(
            low=np.array([0, 0, 0]),
            high=np.array([1, 10, 10]),
            dtype=np.float32
        )
        
        self.agents = [self._init_agent() for _ in range(num_agents)]
        self.time_step = 0
        self.max_steps = 24  # 24 hours simulation
    
    def _init_agent(self):
        return {
            'battery': 50.0,  # 50% initial charge
            'battery_capacity': 10.0,  # 10 kWh
            'production': 0.0,
            'consumption': 0.0
        }
    
    def reset(self):
        self.agents = [self._init_agent() for _ in range(self.num_agents)]
        self.time_step = 0
        self.current_agent = 0
        return self._get_observation()
    
    def _get_observation(self):
        agent = self.agents[self.current_agent]
        
        # Simulate production and consumption
        hour = self.time_step % 24
        agent['production'] = self._simulate_production(hour)
        agent['consumption'] = self._simulate_consumption(hour)
        
        # Get neighbor average states
        neighbors = self._get_neighbors(self.current_agent)
        neighbor_battery_avg = np.mean([n['battery'] for n in neighbors])
        
        obs = np.array([
            agent['battery'] / agent['battery_capacity'],  # Normalized battery
            agent['production'],
            agent['consumption'],
            hour / 24.0,  # Time of day
            neighbor_battery_avg / 100.0,  # Neighbor battery avg
            # Add more features as needed
            0, 0, 0, 0, 0  # Placeholder for additional features
        ], dtype=np.float32)
        
        return obs
    
    def _simulate_production(self, hour):
        if 6 <= hour <= 18:
            return 5 * np.sin((hour - 6) * np.pi / 12) + np.random.normal(0, 0.5)
        return 0
    
    def _simulate_consumption(self, hour):
        if 6 <= hour <= 9 or 18 <= hour <= 22:
            return np.random.uniform(2, 4)
        return np.random.uniform(0.5, 2)
    
    def _get_neighbors(self, agent_id, num_neighbors=5):
        indices = [(agent_id + i) % self.num_agents for i in range(1, num_neighbors + 1)]
        return [self.agents[i] for i in indices]
    
    def step(self, action):
        agent = self.agents[self.current_agent]
        
        # Parse action
        charge_pct, share_amount, sell_amount = action
        
        # Calculate net energy
        net_energy = agent['production'] - agent['consumption']
        
        # Apply actions
        reward = 0
        
        # Action 1: Charge battery
        if charge_pct > 0 and net_energy > 0:
            charge = min(net_energy * charge_pct, 
                        agent['battery_capacity'] - agent['battery'])
            agent['battery'] += charge
            reward += charge * 2  # Reward for storing solar
            net_energy -= charge
        
        # Action 2: Share with neighbors (simplified)
        if share_amount > 0 and net_energy > 0:
            shared = min(share_amount, net_energy)
            reward += shared * 3  # Higher reward for sharing
            net_energy -= shared
        
        # Action 3: Sell to grid
        if sell_amount > 0 and net_energy > 0:
            sold = min(sell_amount, net_energy)
            reward += sold * 1  # Lower reward for grid export
            net_energy -= sold
        
        # Penalties
        if agent['consumption'] > agent['production'] + agent['battery']:
            # Had to buy from grid
            grid_import = agent['consumption'] - (agent['production'] + agent['battery'])
            reward -= grid_import * 5  # Penalty for grid import
        
        if agent['battery'] < 0.2 * agent['battery_capacity']:
            reward -= 10  # Penalty for low battery
        
        # Move to next agent
        self.current_agent = (self.current_agent + 1) % self.num_agents
        
        if self.current_agent == 0:
            self.time_step += 1
        
        done = self.time_step >= self.max_steps
        
        return self._get_observation(), reward, done, {}
    
    def render(self, mode='human'):
        pass


def train_rl_agents(total_timesteps=100000):
    """
    Train RL agents using PPO
    """
    # Create environment
    env = SolarSwarmEnv(num_agents=10)  # Start with 10 agents
    
    # Initialize PPO model
    model = PPO(
        "MlpPolicy",
        env,
        verbose=1,
        learning_rate=0.0003,
        n_steps=2048,
        batch_size=64,
        n_epochs=10,
        gamma=0.99,
        tensorboard_log="./tensorboard/"
    )
    
    # Train
    print("🤖 Training RL agents...")
    model.learn(total_timesteps=total_timesteps)
    
    # Save model
    model.save("models/solar_swarm_ppo")
    print("✅ Model saved!")
    
    return model


# Usage
if __name__ == "__main__":
    model = train_rl_agents(total_timesteps=50000)