"""
Clean Data Module
Wrapper for DataCleaner
"""

from .cleaner import DataCleaner

def clean_solar_data(df):
    """Clean solar production and consumption data"""
    cleaner = DataCleaner()
    
    # Remove outliers from energy columns
    energy_cols = ['production_kwh', 'consumption_kwh']
    
    df = cleaner.clean(df, remove_outliers_cols=energy_cols)
    
    return df
