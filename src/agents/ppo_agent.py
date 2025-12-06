"""
PPO Agent Implementation
Proximal Policy Optimization for solar swarm
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.distributions import Normal
import numpy as np


class ActorCritic(nn.Module):
    """Actor-Critic network for PPO"""
    
    def __init__(self, state_dim, action_dim, hidden_dim=64):
        super(ActorCritic, self).__init__()
        
        # Shared layers
        self.shared = nn.Sequential(
            nn.Linear(state_dim, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.Tanh()
        )
        
        # Actor (policy) head
        self.actor_mean = nn.Linear(hidden_dim, action_dim)
        self.actor_logstd = nn.Parameter(torch.zeros(action_dim))
        
        # Critic (value) head
        self.critic = nn.Linear(hidden_dim, 1)
    
    def forward(self, state):
        shared_features = self.shared(state)
        return shared_features
    
    def act(self, state):
        """Sample action from policy"""
        shared_features = self.forward(state)
        action_mean = self.actor_mean(shared_features)
        action_std = torch.exp(self.actor_logstd)
        
        dist = Normal(action_mean, action_std)
        action = dist.sample()
        action_logprob = dist.log_prob(action).sum(dim=-1)
        
        return action, action_logprob
    
    def evaluate(self, state, action):
        """Evaluate action"""
        shared_features = self.forward(state)
        
        action_mean = self.actor_mean(shared_features)
        action_std = torch.exp(self.actor_logstd)
        
        dist = Normal(action_mean, action_std)
        action_logprob = dist.log_prob(action).sum(dim=-1)
        dist_entropy = dist.entropy().sum(dim=-1)
        
        state_value = self.critic(shared_features).squeeze()
        
        return action_logprob, state_value, dist_entropy


class PPOAgent:
    """
    PPO Agent for continuous action spaces
    """
    
    def __init__(
        self,
        state_dim,
        action_dim,
        lr=0.0003,
        gamma=0.99,
        eps_clip=0.2,
        K_epochs=10,
        gae_lambda=0.95
    ):
        self.gamma = gamma
        self.eps_clip = eps_clip
        self.K_epochs = K_epochs
        self.gae_lambda = gae_lambda
        
        self.policy = ActorCritic(state_dim, action_dim)
        self.optimizer = optim.Adam(self.policy.parameters(), lr=lr)
        self.policy_old = ActorCritic(state_dim, action_dim)
        self.policy_old.load_state_dict(self.policy.state_dict())
        
        self.MseLoss = nn.MSELoss()
        
        # Storage
        self.states = []
        self.actions = []
        self.logprobs = []
        self.rewards = []
        self.is_terminals = []
        self.values = []
    
    def select_action(self, state):
        """Select action using current policy"""
        with torch.no_grad():
            state = torch.FloatTensor(state).unsqueeze(0)
            action, action_logprob = self.policy_old.act(state)
        
        return action.cpu().numpy().flatten(), action_logprob.item()
    
    def store_transition(self, state, action, logprob, reward, done):
        """Store transition"""
        self.states.append(state)
        self.actions.append(action)
        self.logprobs.append(logprob)
        self.rewards.append(reward)
        self.is_terminals.append(done)
    
    def compute_gae(self, rewards, values, dones, next_value):
        """Compute Generalized Advantage Estimation"""
        advantages = []
        gae = 0
        
        values = values + [next_value]
        
        for step in reversed(range(len(rewards))):
            delta = rewards[step] + self.gamma * values[step + 1] * (1 - dones[step]) - values[step]
            gae = delta + self.gamma * self.gae_lambda * (1 - dones[step]) * gae
            advantages.insert(0, gae)
        
        return advantages
    
    def update(self):
        """Update policy using PPO"""
        if len(self.states) == 0:
            return 0
        
        # Convert to tensors
        old_states = torch.FloatTensor(np.array(self.states))
        old_actions = torch.FloatTensor(np.array(self.actions))
        old_logprobs = torch.FloatTensor(self.logprobs)
        
        # Compute values for GAE
        with torch.no_grad():
            values = []
            for state in old_states:
                shared = self.policy_old.forward(state.unsqueeze(0))
                value = self.policy_old.critic(shared).item()
                values.append(value)
        
        # Compute advantages
        advantages = self.compute_gae(self.rewards, values, self.is_terminals, 0)
        advantages = torch.FloatTensor(advantages)
        returns = advantages + torch.FloatTensor(values)
        
        # Normalize advantages
        advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)
        
        # PPO update
        total_loss = 0
        for _ in range(self.K_epochs):
            # Evaluate actions
            logprobs, state_values, dist_entropy = self.policy.evaluate(old_states, old_actions)
            
            # Importance ratio
            ratios = torch.exp(logprobs - old_logprobs)
            
            # Surrogate loss
            surr1 = ratios * advantages
            surr2 = torch.clamp(ratios, 1 - self.eps_clip, 1 + self.eps_clip) * advantages
            
            # Final loss
            actor_loss = -torch.min(surr1, surr2).mean()
            critic_loss = self.MseLoss(state_values, returns)
            entropy_loss = -0.01 * dist_entropy.mean()
            
            loss = actor_loss + 0.5 * critic_loss + entropy_loss
            
            # Optimize
            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()
            
            total_loss += loss.item()
        
        # Update old policy
        self.policy_old.load_state_dict(self.policy.state_dict())
        
        # Clear storage
        self.states = []
        self.actions = []
        self.logprobs = []
        self.rewards = []
        self.is_terminals = []
        self.values = []
        
        return total_loss / self.K_epochs
    
    def save(self, filepath):
        """Save model"""
        torch.save(self.policy.state_dict(), filepath)
    
    def load(self, filepath):
        """Load model"""
        self.policy.load_state_dict(torch.load(filepath))
        self.policy_old.load_state_dict(torch.load(filepath))


# Training function
def train_ppo_agent(env, episodes=1000, max_steps=1000):
    """Train PPO agent"""
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.shape[0]
    
    agent = PPOAgent(state_dim, action_dim)
    
    scores = []
    
    for episode in range(episodes):
        state = env.reset()
        total_reward = 0
        
        for step in range(max_steps):
            action, logprob = agent.select_action(state)
            next_state, reward, done, _ = env.step(action)
            
            agent.store_transition(state, action, logprob, reward, done)
            
            state = next_state
            total_reward += reward
            
            if done:
                break
        
        loss = agent.update()
        scores.append(total_reward)
        
        if (episode + 1) % 10 == 0:
            avg_score = np.mean(scores[-10:])
            print(f"Episode {episode+1}/{episodes}, Avg Score: {avg_score:.2f}, Loss: {loss:.4f}")
    
    return agent


if __name__ == "__main__":
    print("PPO Agent module loaded")
    print("Use train_ppo_agent(env) to train an agent")
