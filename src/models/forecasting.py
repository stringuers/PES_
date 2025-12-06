import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.metrics import mean_squared_error, mean_absolute_error

class SolarForecaster:
    """
    Solar production forecasting using Facebook Prophet
    """
    
    def __init__(self):
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=True,
            changepoint_prior_scale=0.05
        )
    
    def prepare_data(self, df):
        """
        Prepare data for Prophet (requires 'ds' and 'y' columns)
        """
        prophet_df = df[['timestamp', 'production_kwh']].copy()
        prophet_df.columns = ['ds', 'y']
        return prophet_df
    
    def add_weather_features(self, df):
        """
        Add weather as external regressors
        """
        self.model.add_regressor('temperature')
        self.model.add_regressor('cloud_cover')
        self.model.add_regressor('humidity')
    
    def train(self, train_data):
        """
        Train the forecasting model
        """
        prophet_data = self.prepare_data(train_data)
        
        # Add weather features if available
        if 'temperature' in train_data.columns:
            prophet_data['temperature'] = train_data['temperature']
            prophet_data['cloud_cover'] = train_data['cloud_cover']
            prophet_data['humidity'] = train_data['humidity']
            self.add_weather_features(train_data)
        
        self.model.fit(prophet_data)
        print("✅ Model trained successfully")
    
    def predict(self, periods=24):
        """
        Predict solar production for next 'periods' hours
        """
        future = self.model.make_future_dataframe(periods=periods, freq='H')
        
        # Add future weather forecast if needed
        # future['temperature'] = ...
        
        forecast = self.model.predict(future)
        return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    
    def evaluate(self, test_data):
        """
        Evaluate model performance
        """
        test_prophet = self.prepare_data(test_data)
        forecast = self.model.predict(test_prophet)
        
        rmse = np.sqrt(mean_squared_error(test_prophet['y'], forecast['yhat']))
        mae = mean_absolute_error(test_prophet['y'], forecast['yhat'])
        
        return {
            'RMSE': rmse,
            'MAE': mae,
            'MAPE': np.mean(np.abs((test_prophet['y'] - forecast['yhat']) / test_prophet['y'])) * 100
        }

# Usage
if __name__ == "__main__":
    # Load data
    data = pd.read_csv('data/processed/community_90days.csv')
    
    # Split train/test
    train_size = int(len(data) * 0.8)
    train_data = data[:train_size]
    test_data = data[train_size:]
    
    # Train model
    forecaster = SolarForecaster()
    forecaster.train(train_data)
    
    # Evaluate
    metrics = forecaster.evaluate(test_data)
    print(f"Model Performance:")
    print(f"  RMSE: {metrics['RMSE']:.3f} kWh")
    print(f"  MAE: {metrics['MAE']:.3f} kWh")
    print(f"  MAPE: {metrics['MAPE']:.2f}%")
    
    # Predict next 24 hours
    forecast = forecaster.predict(periods=24)
    forecast.to_csv('results/solar_forecast_24h.csv', index=False)