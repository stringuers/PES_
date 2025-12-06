"""
Agents Package
Multi-agent reinforcement learning components
"""

from .base_agent import SolarPanelAgent, SwarmSimulator

# Optional RL agent imports (only if ML libraries are available)
try:
    from .rl_agent import SolarSwarmEnv, train_rl_agents
    __all__ = [
        'SolarPanelAgent',
        'SwarmSimulator',
        'SolarSwarmEnv',
        'train_rl_agents'
    ]
except ImportError:
    # RL libraries not available, but base agents still work
    __all__ = [
        'SolarPanelAgent',
        'SwarmSimulator'
    ]
