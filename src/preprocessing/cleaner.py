"""
Data Cleaner
Handle missing values, outliers, and data quality issues
"""

import pandas as pd
import numpy as np
from typing import Optional, List


class DataCleaner:
    """Clean and prepare raw data"""
    
    def __init__(self):
        self.cleaning_stats = {}
    
    def remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate rows"""
        initial_count = len(df)
        df = df.drop_duplicates()
        removed = initial_count - len(df)
        self.cleaning_stats['duplicates_removed'] = removed
        return df
    
    def handle_missing_values(self, df: pd.DataFrame, strategy='mean') -> pd.DataFrame:
        """Handle missing values"""
        missing_before = df.isnull().sum().sum()
        
        if strategy == 'mean':
            df = df.fillna(df.mean(numeric_only=True))
        elif strategy == 'median':
            df = df.fillna(df.median(numeric_only=True))
        elif strategy == 'forward':
            df = df.fillna(method='ffill')
        elif strategy == 'drop':
            df = df.dropna()
        
        missing_after = df.isnull().sum().sum()
        self.cleaning_stats['missing_handled'] = missing_before - missing_after
        return df
    
    def remove_outliers(self, df: pd.DataFrame, columns: List[str], 
                       method='iqr', threshold=1.5) -> pd.DataFrame:
        """Remove outliers using IQR or Z-score"""
        initial_count = len(df)
        
        for col in columns:
            if col not in df.columns:
                continue
            
            if method == 'iqr':
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - threshold * IQR
                upper = Q3 + threshold * IQR
                df = df[(df[col] >= lower) & (df[col] <= upper)]
            
            elif method == 'zscore':
                z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
                df = df[z_scores < threshold]
        
        removed = initial_count - len(df)
        self.cleaning_stats['outliers_removed'] = removed
        return df
    
    def fix_data_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """Convert columns to appropriate data types"""
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Convert numeric columns
        numeric_cols = df.select_dtypes(include=['object']).columns
        for col in numeric_cols:
            try:
                df[col] = pd.to_numeric(df[col])
            except:
                pass
        
        return df
    
    def clean(self, df: pd.DataFrame, remove_outliers_cols: Optional[List[str]] = None) -> pd.DataFrame:
        """Complete cleaning pipeline"""
        print("🧹 Starting data cleaning...")
        
        df = self.remove_duplicates(df)
        df = self.fix_data_types(df)
        df = self.handle_missing_values(df)
        
        if remove_outliers_cols:
            df = self.remove_outliers(df, remove_outliers_cols)
        
        print(f"✅ Cleaning complete: {self.cleaning_stats}")
        return df
