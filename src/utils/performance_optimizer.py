"""
Performance Optimizations for 100+ Agents
"""
from functools import lru_cache
import numpy as np
from typing import List, Dict

class PerformanceOptimizer:
    """Optimizations for large-scale simulations"""
    
    @staticmethod
    @lru_cache(maxsize=1000)
    def calculate_neighbor_distances(num_agents: int, topology: str = 'grid'):
        """Cache neighbor distance calculations"""
        # Pre-calculate neighbor relationships
        neighbors = {}
        if topology == 'grid':
            grid_size = int(np.sqrt(num_agents))
            for i in range(num_agents):
                row, col = i // grid_size, i % grid_size
                neighbor_list = []
                for dr in [-1, 0, 1]:
                    for dc in [-1, 0, 1]:
                        if dr == 0 and dc == 0:
                            continue
                        nr, nc = row + dr, col + dc
                        if 0 <= nr < grid_size and 0 <= nc < grid_size:
                            neighbor_list.append(nr * grid_size + nc)
                neighbors[i] = neighbor_list
        return neighbors
    
    @staticmethod
    def batch_agent_decisions(agents: List, batch_size: int = 10):
        """Process agent decisions in batches"""
        decisions = []
        for i in range(0, len(agents), batch_size):
            batch = agents[i:i + batch_size]
            batch_decisions = [agent.make_decision() for agent in batch]
            decisions.extend(batch_decisions)
        return decisions
    
    @staticmethod
    def vectorized_production_consumption(hours: np.ndarray, num_agents: int) -> np.ndarray:
        """Vectorized calculation of production/consumption patterns"""
        # Production: sinusoidal pattern
        production = np.where(
            (hours >= 6) & (hours <= 18),
            5 * np.sin((hours - 6) * np.pi / 12),
            0
        )
        
        # Consumption: time-based patterns
        consumption = np.where(
            ((hours >= 6) & (hours < 9)) | ((hours >= 18) & (hours < 22)),
            np.random.uniform(2, 4, num_agents),
            np.where(
                (hours >= 9) & (hours < 18),
                np.random.uniform(1, 2, num_agents),
                np.random.uniform(0.5, 1, num_agents)
            )
        )
        
        return production, consumption
    
    @staticmethod
    def optimize_energy_flow_calculation(flows: List[Dict], threshold: float = 0.1):
        """Filter out negligible energy flows"""
        return [f for f in flows if f.get('amount', 0) > threshold]

