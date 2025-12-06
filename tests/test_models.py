"""
Test ML Models
"""

import pytest
import numpy as np
import torch
from src.models.lstm_forecaster import SolarLSTM
from src.utils.metrics import PerformanceEvaluator


class TestLSTMModel:
    """Test LSTM forecaster"""
    
    def test_model_initialization(self):
        """Test LSTM model creation"""
        model = SolarLSTM(input_size=10, hidden_size=64, num_layers=2)
        
        assert model.hidden_size == 64
        assert model.num_layers == 2
    
    def test_forward_pass(self):
        """Test forward propagation"""
        model = SolarLSTM(input_size=5, hidden_size=32, num_layers=1)
        
        # Create dummy input (batch_size=2, seq_len=10, features=5)
        x = torch.randn(2, 10, 5)
        output = model(x)
        
        assert output.shape == (2, 1)  # (batch_size, output_size)
    
    def test_model_training(self):
        """Test model can be trained"""
        model = SolarLSTM(input_size=3, hidden_size=16, num_layers=1)
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        criterion = torch.nn.MSELoss()
        
        # Dummy data
        x = torch.randn(4, 5, 3)
        y = torch.randn(4, 1)
        
        # Training step
        optimizer.zero_grad()
        output = model(x)
        loss = criterion(output, y)
        loss.backward()
        optimizer.step()
        
        assert loss.item() >= 0


class TestMetrics:
    """Test performance metrics"""
    
    def test_evaluator_initialization(self):
        """Test evaluator creation"""
        evaluator = PerformanceEvaluator()
        assert evaluator is not None
    
    def test_forecasting_metrics(self):
        """Test forecasting evaluation"""
        evaluator = PerformanceEvaluator()
        
        y_true = np.array([1, 2, 3, 4, 5])
        y_pred = np.array([1.1, 2.2, 2.9, 4.1, 5.2])
        
        metrics = evaluator.evaluate_forecasting(y_true, y_pred)
        
        assert 'RMSE' in metrics
        assert 'MAE' in metrics
        assert 'MAPE' in metrics
        assert metrics['RMSE'] > 0
    
    def test_energy_metrics(self):
        """Test energy metrics calculation"""
        evaluator = PerformanceEvaluator()
        
        results = {
            'production': [100] * 24,
            'consumption': [80] * 24,
            'solar_used': [70] * 24,
            'grid_import': [10] * 24,
            'energy_shared': [5] * 24
        }
        
        metrics = evaluator.calculate_energy_metrics(results)
        
        assert 'solar_utilization_pct' in metrics
        assert 'self_sufficiency_pct' in metrics
        assert metrics['solar_utilization_pct'] > 0
