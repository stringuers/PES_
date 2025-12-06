"""
Swarm Simulation
High-level swarm simulation orchestration
"""

import numpy as np
from typing import Dict, List
from .environment import SolarEnvironment
from .neighbors import NeighborhoodTopology


class SwarmSimulation:
    """Complete swarm simulation"""
    
    def __init__(self, num_agents=50, topology='grid'):
        self.num_agents = num_agents
        self.environment = SolarEnvironment(num_agents)
        self.topology = NeighborhoodTopology(num_agents, topology_type=topology)
        
        self.results = {
            'production': [],
            'consumption': [],
            'battery_soc': [],
            'grid_import': [],
            'grid_export': [],
            'energy_shared': []
        }
    
    def simulate_consumption(self, hour) -> List[float]:
        """Simulate consumption for all agents"""
        consumptions = []
        
        for i in range(self.num_agents):
            # Time-based consumption pattern
            if 6 <= hour < 9 or 18 <= hour < 22:
                base = np.random.uniform(2, 4)
            elif 9 <= hour < 18:
                base = np.random.uniform(1, 2)
            else:
                base = np.random.uniform(0.5, 1)
            
            consumptions.append(base)
        
        return consumptions
    
    def run(self, hours=24) -> Dict:
        """Run simulation"""
        print(f"🐝 Running swarm simulation: {self.num_agents} agents, {hours} hours")
        
        for hour in range(hours):
            # Get consumption demands
            consumptions = self.simulate_consumption(hour % 24)
            
            # Step environment
            step_results = self.environment.step(consumptions)
            
            # Aggregate results
            self.results['production'].append(sum(r['production'] for r in step_results))
            self.results['consumption'].append(sum(r['consumption'] for r in step_results))
            self.results['battery_soc'].append(np.mean([r['battery_soc'] for r in step_results]))
            self.results['grid_import'].append(sum(r['grid_import'] for r in step_results))
            self.results['grid_export'].append(sum(r['grid_export'] for r in step_results))
        
        print(f"✅ Simulation complete")
        return self.results
