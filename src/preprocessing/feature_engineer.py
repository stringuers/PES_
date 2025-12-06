"""
Feature Engineering
Create derived features for ML models
"""

import pandas as pd
import numpy as np


class FeatureEngineer:
    """Generate features from raw data"""
    
    def __init__(self):
        self.feature_names = []
    
    def add_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract time-based features"""
        if 'timestamp' not in df.columns:
            return df
        
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['day_of_month'] = df['timestamp'].dt.day
        df['month'] = df['timestamp'].dt.month
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        
        # Cyclical encoding
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        
        self.feature_names.extend(['hour', 'day_of_week', 'month', 'is_weekend',
                                   'hour_sin', 'hour_cos', 'month_sin', 'month_cos'])
        return df
    
    def add_energy_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create energy-related features"""
        if 'production_kwh' in df.columns and 'consumption_kwh' in df.columns:
            df['net_energy'] = df['production_kwh'] - df['consumption_kwh']
            df['energy_ratio'] = df['production_kwh'] / (df['consumption_kwh'] + 0.001)
            df['is_surplus'] = (df['net_energy'] > 0).astype(int)
            
            self.feature_names.extend(['net_energy', 'energy_ratio', 'is_surplus'])
        
        return df
    
    def add_weather_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create weather-related features"""
        if 'temperature_c' in df.columns:
            df['temp_squared'] = df['temperature_c'] ** 2
            self.feature_names.append('temp_squared')
        
        if 'cloud_cover_pct' in df.columns:
            df['clear_sky'] = (100 - df['cloud_cover_pct']) / 100
            df['is_cloudy'] = (df['cloud_cover_pct'] > 50).astype(int)
            self.feature_names.extend(['clear_sky', 'is_cloudy'])
        
        return df
    
    def add_lag_features(self, df: pd.DataFrame, columns: list, lags: list = [1, 2, 3]) -> pd.DataFrame:
        """Add lagged features"""
        for col in columns:
            if col not in df.columns:
                continue
            for lag in lags:
                df[f'{col}_lag{lag}'] = df[col].shift(lag)
                self.feature_names.append(f'{col}_lag{lag}')
        
        return df
    
    def add_rolling_features(self, df: pd.DataFrame, columns: list, windows: list = [3, 6, 12]) -> pd.DataFrame:
        """Add rolling statistics"""
        for col in columns:
            if col not in df.columns:
                continue
            for window in windows:
                df[f'{col}_rolling_mean_{window}'] = df[col].rolling(window=window).mean()
                df[f'{col}_rolling_std_{window}'] = df[col].rolling(window=window).std()
                self.feature_names.extend([f'{col}_rolling_mean_{window}', f'{col}_rolling_std_{window}'])
        
        return df
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Complete feature engineering pipeline"""
        print("🔧 Engineering features...")
        
        df = self.add_time_features(df)
        df = self.add_energy_features(df)
        df = self.add_weather_features(df)
        
        # Add lags for production
        if 'production_kwh' in df.columns:
            df = self.add_lag_features(df, ['production_kwh'], lags=[1, 24])
        
        print(f"✅ Created {len(self.feature_names)} features")
        return df
