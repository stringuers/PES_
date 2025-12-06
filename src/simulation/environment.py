"""
Solar Environment
Complete simulation environment integrating all components
"""

import numpy as np
from .battery import BatterySystem
from .grid import GridConnection
from .physics import SolarPhysics


class SolarEnvironment:
    """Complete solar system environment"""
    
    def __init__(self, num_houses=50):
        self.num_houses = num_houses
        self.current_hour = 0
        self.current_day = 0
        
        # Create systems for each house
        self.batteries = [BatterySystem() for _ in range(num_houses)]
        self.grids = [GridConnection() for _ in range(num_houses)]
        self.solar_panels = [SolarPhysics() for _ in range(num_houses)]
        
        # State tracking
        self.production_history = []
        self.consumption_history = []
    
    def step(self, consumption_demands, dt=1.0):
        """Simulate one time step"""
        hour = self.current_hour % 24
        day = self.current_day
        
        # Simulate production for all houses
        productions = []
        for i in range(self.num_houses):
            # Random weather
            temperature = 20 + 10 * np.sin((day / 365) * 2 * np.pi) + np.random.normal(0, 2)
            cloud_cover = np.random.beta(2, 5) * 100
            
            production = self.solar_panels[i].simulate_production(
                hour, day, temperature, cloud_cover
            )
            productions.append(production)
        
        # Energy management for each house
        results = []
        for i in range(self.num_houses):
            production = productions[i]
            consumption = consumption_demands[i]
            
            net_energy = production - consumption
            
            if net_energy > 0:
                # Surplus: charge battery or export
                charged = self.batteries[i].charge(net_energy, dt)
                remaining = net_energy - charged
                
                if remaining > 0:
                    exported, revenue = self.grids[i].export_energy(remaining, dt)
                else:
                    exported, revenue = 0, 0
            else:
                # Deficit: discharge battery or import
                deficit = abs(net_energy)
                discharged = self.batteries[i].discharge(deficit, dt)
                remaining_deficit = deficit - discharged
                
                if remaining_deficit > 0:
                    imported, cost = self.grids[i].import_energy(remaining_deficit, dt)
                else:
                    imported, cost = 0, 0
            
            results.append({
                'production': production,
                'consumption': consumption,
                'battery_soc': self.batteries[i].get_state_of_charge(),
                'grid_import': self.grids[i].total_import if net_energy < 0 else 0,
                'grid_export': self.grids[i].total_export if net_energy > 0 else 0
            })
        
        # Update time
        self.current_hour += 1
        if self.current_hour % 24 == 0:
            self.current_day += 1
        
        return results
    
    def reset(self):
        """Reset environment"""
        self.current_hour = 0
        self.current_day = 0
        
        for battery in self.batteries:
            battery.reset()
        
        for grid in self.grids:
            grid.reset()
