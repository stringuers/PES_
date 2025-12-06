"""
Solar Physics Simulation
Model solar irradiance and panel physics
"""

import numpy as np


class SolarPhysics:
    """Solar panel physics simulation"""
    
    def __init__(self, panel_area_m2=25.0, panel_efficiency=0.18, temperature_coefficient=-0.004):
        self.panel_area = panel_area_m2
        self.panel_efficiency = panel_efficiency
        self.temp_coefficient = temperature_coefficient
        self.reference_temp = 25.0  # °C
    
    def calculate_irradiance(self, hour, day_of_year, latitude=36.8, cloud_cover=0):
        """Calculate solar irradiance (W/m²)"""
        # Simple model: sinusoidal pattern with seasonal variation
        if 6 <= hour <= 18:
            # Solar elevation angle (simplified)
            hour_angle = (hour - 12) * 15  # degrees
            
            # Seasonal declination
            declination = 23.45 * np.sin(np.radians((360/365) * (day_of_year - 81)))
            
            # Solar elevation
            elevation = np.arcsin(
                np.sin(np.radians(latitude)) * np.sin(np.radians(declination)) +
                np.cos(np.radians(latitude)) * np.cos(np.radians(declination)) * 
                np.cos(np.radians(hour_angle))
            )
            
            # Base irradiance
            base_irradiance = 1000 * np.sin(elevation)
            
            # Cloud effect
            cloud_factor = 1.0 - (cloud_cover / 100) * 0.75
            
            irradiance = max(0, base_irradiance * cloud_factor)
        else:
            irradiance = 0
        
        return irradiance
    
    def calculate_power(self, irradiance, temperature):
        """Calculate panel power output (kW)"""
        # Temperature effect on efficiency
        temp_diff = temperature - self.reference_temp
        efficiency = self.panel_efficiency * (1 + self.temp_coefficient * temp_diff)
        
        # Power = Irradiance × Area × Efficiency
        power_w = irradiance * self.panel_area * efficiency
        power_kw = power_w / 1000
        
        return power_kw
    
    def simulate_production(self, hour, day_of_year, temperature, cloud_cover=0):
        """Simulate solar production for given conditions"""
        irradiance = self.calculate_irradiance(hour, day_of_year, cloud_cover=cloud_cover)
        power = self.calculate_power(irradiance, temperature)
        
        return power
