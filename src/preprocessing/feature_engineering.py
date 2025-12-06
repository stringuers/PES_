"""
Feature Engineering Module
Wrapper for FeatureEngineer
"""

from .feature_engineer import FeatureEngineer

def create_features(df):
    """Create features for solar data"""
    engineer = FeatureEngineer()
    return engineer.engineer_features(df)
