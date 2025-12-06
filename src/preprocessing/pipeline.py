import numpy as np
import pandas as pd

class DataPreprocessor:
    """
    Complete data preprocessing pipeline
    """
    
    def __init__(self):
        self.scalers = {}
    
    def clean_data(self, df):
        """
        Handle missing values and outliers
        """
        # Remove duplicates
        df = df.drop_duplicates()
        
        # Handle missing values
        df = df.fillna(method='ffill').fillna(method='bfill')
        
        # Remove outliers (> 3 std dev)
        for col in df.select_dtypes(include=[np.number]).columns:
            mean = df[col].mean()
            std = df[col].std()
            df = df[(df[col] >= mean - 3*std) & (df[col] <= mean + 3*std)]
        
        return df
    
    def engineer_features(self, df):
        """
        Create derived features
        """
        # Time features
        df['hour'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['month'] = df['timestamp'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Cyclical encoding
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        
        # Rolling features
        df['production_rolling_24h'] = df['production'].rolling(24).mean()
        df['production_rolling_7d'] = df['production'].rolling(24*7).mean()
        
        # Lag features
        df['production_lag_1h'] = df['production'].shift(1)
        df['production_lag_24h'] = df['production'].shift(24)
        
        return df
    
    def normalize(self, df, columns):
        """
        Normalize numerical features
        """
        from sklearn.preprocessing import StandardScaler
        
        for col in columns:
            if col not in self.scalers:
                self.scalers[col] = StandardScaler()
                df[col] = self.scalers[col].fit_transform(df[[col]])
            else:
                df[col] = self.scalers[col].transform(df[[col]])
        
        return df
    
    def create_sequences(self, df, sequence_length=24, target_col='production'):
        """
        Create sequences for time series models
        """
        X, y = [], []
        
        for i in range(len(df) - sequence_length):
            X.append(df.iloc[i:i+sequence_length].values)
            y.append(df.iloc[i+sequence_length][target_col])
        
        return np.array(X), np.array(y)