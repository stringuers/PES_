"""
Forecasting Service
Loads and uses LSTM/Prophet models for predictions
"""
import os
import torch
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional

try:
    from ..models.lstm_forecaster import SolarLSTM
    from ..models.forecasting import SolarForecaster
    LSTM_AVAILABLE = True
    PROPHET_AVAILABLE = True
except ImportError:
    LSTM_AVAILABLE = False
    PROPHET_AVAILABLE = False

class ForecastingService:
    """Service for solar production forecasting"""
    
    def __init__(self):
        self.lstm_model = None
        self.prophet_model = None
        self.model_type = "simple"  # simple, lstm, prophet
        self._load_models()
    
    def _load_models(self):
        """Load trained models if available"""
        # Try to load LSTM
        lstm_path = Path("models/best_lstm.pth")
        if lstm_path.exists() and LSTM_AVAILABLE:
            try:
                self.lstm_model = SolarLSTM(input_size=10, hidden_size=64, num_layers=2)
                self.lstm_model.load_state_dict(torch.load(lstm_path, map_location='cpu'))
                self.lstm_model.eval()
                self.model_type = "lstm"
                print("✅ Loaded LSTM forecasting model")
            except Exception as e:
                print(f"⚠️ Could not load LSTM model: {e}")
        
        # Try to load Prophet
        prophet_path = Path("models/prophet_model.pkl")
        if prophet_path.exists() and PROPHET_AVAILABLE:
            try:
                import pickle
                with open(prophet_path, 'rb') as f:
                    self.prophet_model = pickle.load(f)
                self.model_type = "prophet"
                print("✅ Loaded Prophet forecasting model")
            except Exception as e:
                print(f"⚠️ Could not load Prophet model: {e}")
    
    def predict_24h(
        self,
        historical_data: Optional[List[Dict]] = None,
        weather_forecast: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Predict solar production for next 24 hours
        """
        now = datetime.now()
        timestamps = [now + timedelta(hours=i) for i in range(24)]
        
        if self.model_type == "lstm" and self.lstm_model and historical_data:
            return self._predict_lstm(timestamps, historical_data)
        elif self.model_type == "prophet" and self.prophet_model:
            return self._predict_prophet(timestamps, weather_forecast)
        else:
            return self._predict_simple(timestamps, weather_forecast)
    
    def _predict_simple(self, timestamps: List[datetime], weather: Optional[Dict] = None) -> List[Dict]:
        """Simple sinusoidal forecast"""
        forecast = []
        
        for ts in timestamps:
            hour = ts.hour
            
            # Base production pattern
            if 6 <= hour <= 18:
                production = 5 * np.sin((hour - 6) * np.pi / 12)
            else:
                production = 0
            
            # Apply weather effects
            if weather:
                cloud_cover = weather.get('cloud_cover', 0) / 100.0
                production *= (1 - cloud_cover * 0.7)
            
            forecast.append({
                "timestamp": ts.isoformat(),
                "predicted_kwh": round(max(0, production), 2),
                "confidence_lower": round(max(0, production * 0.85), 2),
                "confidence_upper": round(production * 1.15, 2)
            })
        
        return forecast
    
    def _predict_lstm(self, timestamps: List[datetime], historical: List[Dict]) -> List[Dict]:
        """Predict using LSTM model"""
        try:
            # Prepare input sequence (last 24 hours)
            if len(historical) < 24:
                return self._predict_simple(timestamps)
            
            # Extract features from historical data
            sequence = []
            for h in historical[-24:]:
                # Features: [hour, production, consumption, battery, ...]
                features = np.array([
                    h.get('hour', 12) / 24.0,
                    h.get('production', 0) / 10.0,
                    h.get('consumption', 0) / 10.0,
                    h.get('battery_pct', 0.5),
                    0, 0, 0, 0, 0, 0  # Placeholder for additional features
                ])
                sequence.append(features)
            
            sequence = np.array(sequence)
            sequence_tensor = torch.FloatTensor(sequence).unsqueeze(0)
            
            # Generate predictions
            forecast = []
            with torch.no_grad():
                for i, ts in enumerate(timestamps):
                    pred = self.lstm_model(sequence_tensor)
                    pred_value = pred.item() * 10.0  # Denormalize
                    
                    forecast.append({
                        "timestamp": ts.isoformat(),
                        "predicted_kwh": round(max(0, pred_value), 2),
                        "confidence_lower": round(max(0, pred_value * 0.9), 2),
                        "confidence_upper": round(pred_value * 1.1, 2)
                    })
                    
                    # Update sequence for next prediction
                    new_features = sequence[-1].copy()
                    new_features[1] = pred_value / 10.0
                    sequence = np.vstack([sequence[1:], new_features])
                    sequence_tensor = torch.FloatTensor(sequence).unsqueeze(0)
            
            return forecast
        except Exception as e:
            print(f"LSTM prediction failed: {e}, falling back to simple")
            return self._predict_simple(timestamps)
    
    def _predict_prophet(self, timestamps: List[datetime], weather: Optional[Dict] = None) -> List[Dict]:
        """Predict using Prophet model"""
        try:
            future = self.prophet_model.make_future_dataframe(periods=24, freq='H')
            
            if weather:
                # Add weather regressors
                future['temperature'] = weather.get('temperature', 20)
                future['cloud_cover'] = weather.get('cloud_cover', 0) / 100.0
                future['humidity'] = weather.get('humidity', 50) / 100.0
            
            forecast_df = self.prophet_model.predict(future)
            forecast_df = forecast_df.tail(24)
            
            forecast = []
            for i, ts in enumerate(timestamps):
                row = forecast_df.iloc[i]
                forecast.append({
                    "timestamp": ts.isoformat(),
                    "predicted_kwh": round(max(0, row['yhat']), 2),
                    "confidence_lower": round(max(0, row['yhat_lower']), 2),
                    "confidence_upper": round(row['yhat_upper'], 2)
                })
            
            return forecast
        except Exception as e:
            print(f"Prophet prediction failed: {e}, falling back to simple")
            return self._predict_simple(timestamps, weather)

# Global service instance
_forecasting_service = None

def get_forecasting_service() -> ForecastingService:
    """Get or create forecasting service singleton"""
    global _forecasting_service
    if _forecasting_service is None:
        _forecasting_service = ForecastingService()
    return _forecasting_service

