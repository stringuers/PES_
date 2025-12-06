"""
Test Data Collection Module
"""

import pytest
import pandas as pd
from src.data_collection.generate_synthetic import SyntheticDataGenerator


class TestSyntheticDataGenerator:
    """Test synthetic data generation"""
    
    def test_generator_initialization(self):
        """Test generator creation"""
        gen = SyntheticDataGenerator(num_houses=10, days=7)
        
        assert gen.num_houses == 10
        assert gen.days == 7
        assert len(gen.house_profiles) == 10
    
    def test_house_profiles(self):
        """Test house profile generation"""
        gen = SyntheticDataGenerator(num_houses=5, days=1)
        
        for profile in gen.house_profiles:
            assert 'house_id' in profile
            assert 'consumption_type' in profile
            assert 'panel_capacity_kw' in profile
            assert profile['consumption_type'] in ['low', 'medium', 'high']
    
    def test_solar_production(self):
        """Test solar production simulation"""
        from datetime import datetime
        
        gen = SyntheticDataGenerator(num_houses=1, days=1)
        
        # Daytime production
        noon = datetime(2024, 6, 21, 12, 0)
        production = gen.generate_solar_production(0, noon)
        assert production > 0
        
        # Nighttime production
        midnight = datetime(2024, 6, 21, 0, 0)
        production = gen.generate_solar_production(0, midnight)
        assert production == 0
    
    def test_consumption_generation(self):
        """Test consumption simulation"""
        from datetime import datetime
        
        gen = SyntheticDataGenerator(num_houses=1, days=1)
        
        timestamp = datetime(2024, 1, 1, 12, 0)
        consumption = gen.generate_consumption(0, timestamp)
        assert consumption > 0
    
    def test_dataset_generation(self):
        """Test complete dataset generation"""
        gen = SyntheticDataGenerator(num_houses=2, days=1)
        df = gen.generate_dataset()
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 2 * 24  # 2 houses × 24 hours
        assert 'production_kwh' in df.columns
        assert 'consumption_kwh' in df.columns
        assert 'temperature_c' in df.columns
