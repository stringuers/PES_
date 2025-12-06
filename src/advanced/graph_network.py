import torch
import torch.nn as nn
from torch_geometric.nn import GCNConv

class EnergyFlowGNN(nn.Module):
    """
    Graph Neural Network to optimize energy flows in neighborhood topology
    """
    
    def __init__(self, num_features=5, hidden_channels=64):
        super(EnergyFlowGNN, self).__init__()
        
        self.conv1 = GCNConv(num_features, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        self.conv3 = GCNConv(hidden_channels, 1)  # Output: optimal flow
    
    def forward(self, x, edge_index):
        # x: Node features [num_nodes, num_features]
        # edge_index: Graph connectivity [2, num_edges]
        
        x = self.conv1(x, edge_index)
        x = torch.relu(x)
        x = self.conv2(x, edge_index)
        x = torch.relu(x)
        x = self.conv3(x, edge_index)
        
        return x

def create_neighborhood_graph(agents):
    """
    Create graph representation of neighborhood
    """
    import torch
    from torch_geometric.data import Data
    
    # Node features: [production, consumption, battery, location_x, location_y]
    node_features = torch.tensor([
        [agent.production, agent.consumption, agent.battery, 
         agent.location[0], agent.location[1]]
        for agent in agents
    ], dtype=torch.float)
    
    # Edge index: Connect neighbors (within distance threshold)
    edges = []
    for i, agent_i in enumerate(agents):
        for j, agent_j in enumerate(agents):
            if i != j:
                distance = calculate_distance(agent_i.location, agent_j.location)
                if distance < 5:  # Threshold
                    edges.append([i, j])
    
    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    
    return Data(x=node_features, edge_index=edge_index)

def optimize_energy_flows(agents, gnn_model):
    """
    Use GNN to find optimal energy routing
    """
    graph = create_neighborhood_graph(agents)
    
    with torch.no_grad():
        optimal_flows = gnn_model(graph.x, graph.edge_index)
    
    return optimal_flows