"""
Battery System Simulation
Model battery charging, discharging, and degradation
"""

import numpy as np


class BatterySystem:
    """Battery energy storage system"""
    
    def __init__(self, capacity_kwh=10.0, efficiency=0.95, max_charge_rate=5.0, max_discharge_rate=5.0):
        self.capacity = capacity_kwh
        self.efficiency = efficiency
        self.max_charge_rate = max_charge_rate
        self.max_discharge_rate = max_discharge_rate
        
        self.current_charge = capacity_kwh * 0.5  # Start at 50%
        self.cycles = 0
        self.degradation_factor = 1.0
    
    def charge(self, energy_kwh, dt=1.0):
        """Charge battery"""
        # Apply charge rate limit
        max_charge = min(energy_kwh, self.max_charge_rate * dt)
        
        # Apply capacity limit
        available_capacity = self.capacity * self.degradation_factor - self.current_charge
        actual_charge = min(max_charge, available_capacity)
        
        # Apply efficiency loss
        self.current_charge += actual_charge * self.efficiency
        
        # Track cycles
        self.cycles += actual_charge / self.capacity
        
        return actual_charge
    
    def discharge(self, energy_kwh, dt=1.0):
        """Discharge battery"""
        # Apply discharge rate limit
        max_discharge = min(energy_kwh, self.max_discharge_rate * dt)
        
        # Apply available energy limit
        actual_discharge = min(max_discharge, self.current_charge)
        
        # Apply efficiency loss
        self.current_charge -= actual_discharge
        energy_delivered = actual_discharge * self.efficiency
        
        # Track cycles
        self.cycles += actual_discharge / self.capacity
        
        return energy_delivered
    
    def get_state_of_charge(self):
        """Get battery state of charge (0-100%)"""
        return (self.current_charge / (self.capacity * self.degradation_factor)) * 100
    
    def update_degradation(self):
        """Update battery degradation based on cycles"""
        # Linear degradation: 20% capacity loss after 5000 cycles
        degradation_rate = 0.2 / 5000
        self.degradation_factor = max(0.8, 1.0 - (self.cycles * degradation_rate))
    
    def reset(self):
        """Reset battery to initial state"""
        self.current_charge = self.capacity * 0.5
        self.cycles = 0
        self.degradation_factor = 1.0
