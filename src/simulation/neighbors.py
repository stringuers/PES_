"""
Neighborhood Topology
Define spatial relationships between agents
"""

import numpy as np
from typing import List, Tuple


class NeighborhoodTopology:
    """Manage agent neighborhood relationships"""
    
    def __init__(self, num_agents, topology_type='grid', grid_size=(10, 5)):
        self.num_agents = num_agents
        self.topology_type = topology_type
        self.grid_size = grid_size
        
        self.positions = self._create_positions()
        self.adjacency_matrix = self._create_adjacency_matrix()
    
    def _create_positions(self) -> List[Tuple[int, int]]:
        """Create agent positions"""
        positions = []
        
        if self.topology_type == 'grid':
            rows, cols = self.grid_size
            for i in range(self.num_agents):
                row = i // cols
                col = i % cols
                positions.append((row, col))
        
        elif self.topology_type == 'random':
            for i in range(self.num_agents):
                x = np.random.uniform(0, 10)
                y = np.random.uniform(0, 10)
                positions.append((x, y))
        
        return positions
    
    def _create_adjacency_matrix(self) -> np.ndarray:
        """Create adjacency matrix"""
        adj = np.zeros((self.num_agents, self.num_agents))
        
        for i in range(self.num_agents):
            neighbors = self.get_neighbors(i, radius=1)
            for j in neighbors:
                adj[i, j] = 1
        
        return adj
    
    def get_neighbors(self, agent_id, radius=1) -> List[int]:
        """Get neighbors within radius"""
        neighbors = []
        pos_i = self.positions[agent_id]
        
        for j, pos_j in enumerate(self.positions):
            if j == agent_id:
                continue
            
            # Manhattan distance
            dist = abs(pos_i[0] - pos_j[0]) + abs(pos_i[1] - pos_j[1])
            
            if dist <= radius:
                neighbors.append(j)
        
        return neighbors
    
    def get_distance(self, agent_i, agent_j) -> float:
        """Get distance between two agents"""
        pos_i = self.positions[agent_i]
        pos_j = self.positions[agent_j]
        
        return np.sqrt((pos_i[0] - pos_j[0])**2 + (pos_i[1] - pos_j[1])**2)
