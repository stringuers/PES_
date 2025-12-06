"""
Data Validation
Validate data quality and constraints
"""

import pandas as pd
import numpy as np
from typing import Dict, List


class DataValidator:
    """Validate data quality"""
    
    def __init__(self):
        self.validation_results = {}
    
    def check_missing_values(self, df: pd.DataFrame) -> Dict:
        """Check for missing values"""
        missing = df.isnull().sum()
        missing_pct = (missing / len(df)) * 100
        
        result = {
            'total_missing': missing.sum(),
            'columns_with_missing': missing[missing > 0].to_dict(),
            'missing_percentage': missing_pct[missing_pct > 0].to_dict()
        }
        
        self.validation_results['missing_values'] = result
        return result
    
    def check_data_types(self, df: pd.DataFrame) -> Dict:
        """Validate data types"""
        result = {
            'dtypes': df.dtypes.to_dict(),
            'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist(),
            'object_columns': df.select_dtypes(include=['object']).columns.tolist()
        }
        
        self.validation_results['data_types'] = result
        return result
    
    def check_value_ranges(self, df: pd.DataFrame, ranges: Dict) -> Dict:
        """Check if values are within expected ranges"""
        violations = {}
        
        for col, (min_val, max_val) in ranges.items():
            if col not in df.columns:
                continue
            
            below_min = (df[col] < min_val).sum()
            above_max = (df[col] > max_val).sum()
            
            if below_min > 0 or above_max > 0:
                violations[col] = {
                    'below_min': below_min,
                    'above_max': above_max
                }
        
        self.validation_results['range_violations'] = violations
        return violations
    
    def check_duplicates(self, df: pd.DataFrame) -> Dict:
        """Check for duplicate rows"""
        duplicates = df.duplicated().sum()
        
        result = {
            'total_duplicates': duplicates,
            'duplicate_percentage': (duplicates / len(df)) * 100
        }
        
        self.validation_results['duplicates'] = result
        return result
    
    def validate_solar_data(self, df: pd.DataFrame) -> Dict:
        """Validate solar energy data"""
        print("🔍 Validating data...")
        
        # Check missing values
        self.check_missing_values(df)
        
        # Check data types
        self.check_data_types(df)
        
        # Check duplicates
        self.check_duplicates(df)
        
        # Check value ranges
        ranges = {
            'production_kwh': (0, 10),
            'consumption_kwh': (0, 10),
            'temperature_c': (-10, 50),
            'cloud_cover_pct': (0, 100),
            'humidity_pct': (0, 100)
        }
        self.check_value_ranges(df, ranges)
        
        # Print summary
        print(f"✅ Validation complete")
        print(f"   Missing values: {self.validation_results['missing_values']['total_missing']}")
        print(f"   Duplicates: {self.validation_results['duplicates']['total_duplicates']}")
        
        return self.validation_results
