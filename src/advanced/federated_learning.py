import torch
from torch import nn

class FederatedLearning:
    """
    Train models across multiple homes without sharing raw data
    """
    
    def __init__(self, num_clients=50):
        self.num_clients = num_clients
        self.global_model = self.create_model()
        self.client_models = [self.create_model() for _ in range(num_clients)]
    
    def create_model(self):
        return nn.Sequential(
            nn.Linear(10, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )
    
    def train_round(self, client_data):
        """
        One round of federated training
        """
        client_weights = []
        
        # Each client trains locally
        for i, data in enumerate(client_data):
            # Load global model
            self.client_models[i].load_state_dict(
                self.global_model.state_dict()
            )
            
            # Train on local data
            self.train_local(self.client_models[i], data)
            
            # Collect weights
            client_weights.append(
                self.client_models[i].state_dict()
            )
        
        # Aggregate weights (Federated Averaging)
        global_weights = self.aggregate_weights(client_weights)
        
        # Update global model
        self.global_model.load_state_dict(global_weights)
    
    def aggregate_weights(self, client_weights):
        """
        Average weights from all clients
        """
        averaged_weights = {}
        
        for key in client_weights[0].keys():
            averaged_weights[key] = torch.stack([
                client[key].float() for client in client_weights
            ]).mean(0)
        
        return averaged_weights
    
    def train_local(self, model, data, epochs=5):
        """
        Train model on local data
        """
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        criterion = nn.MSELoss()
        
        for epoch in range(epochs):
            for X, y in data:
                optimizer.zero_grad()
                pred = model(X)
                loss = criterion(pred, y)
                loss.backward()
                optimizer.step()
                