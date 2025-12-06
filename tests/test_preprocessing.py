"""
Test Preprocessing Module
"""

import pytest
import pandas as pd
import numpy as np
from src.preprocessing.cleaner import DataCleaner
from src.preprocessing.feature_engineer import FeatureEngineer
from src.preprocessing.data_validation import DataValidator


class TestDataCleaner:
    """Test data cleaning"""
    
    def test_remove_duplicates(self):
        """Test duplicate removal"""
        df = pd.DataFrame({
            'a': [1, 2, 2, 3],
            'b': [4, 5, 5, 6]
        })
        
        cleaner = DataCleaner()
        df_clean = cleaner.remove_duplicates(df)
        
        assert len(df_clean) == 3
    
    def test_handle_missing_values(self):
        """Test missing value handling"""
        df = pd.DataFrame({
            'a': [1, 2, np.nan, 4],
            'b': [5, np.nan, 7, 8]
        })
        
        cleaner = DataCleaner()
        df_clean = cleaner.handle_missing_values(df, strategy='mean')
        
        assert df_clean.isnull().sum().sum() == 0


class TestFeatureEngineer:
    """Test feature engineering"""
    
    def test_time_features(self):
        """Test time feature extraction"""
        df = pd.DataFrame({
            'timestamp': pd.date_range('2024-01-01', periods=24, freq='H')
        })
        
        engineer = FeatureEngineer()
        df_features = engineer.add_time_features(df)
        
        assert 'hour' in df_features.columns
        assert 'day_of_week' in df_features.columns
        assert 'month' in df_features.columns
    
    def test_energy_features(self):
        """Test energy feature creation"""
        df = pd.DataFrame({
            'production_kwh': [5, 3, 2],
            'consumption_kwh': [2, 4, 3]
        })
        
        engineer = FeatureEngineer()
        df_features = engineer.add_energy_features(df)
        
        assert 'net_energy' in df_features.columns
        assert 'energy_ratio' in df_features.columns


class TestDataValidator:
    """Test data validation"""
    
    def test_check_missing_values(self):
        """Test missing value detection"""
        df = pd.DataFrame({
            'a': [1, 2, np.nan],
            'b': [4, 5, 6]
        })
        
        validator = DataValidator()
        result = validator.check_missing_values(df)
        
        assert result['total_missing'] == 1
    
    def test_check_duplicates(self):
        """Test duplicate detection"""
        df = pd.DataFrame({
            'a': [1, 2, 2],
            'b': [3, 4, 4]
        })
        
        validator = DataValidator()
        result = validator.check_duplicates(df)
        
        assert result['total_duplicates'] == 1
