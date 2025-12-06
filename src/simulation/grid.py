"""
Grid Connection Simulation
Model grid import/export and pricing
"""

import numpy as np


class GridConnection:
    """Utility grid connection"""
    
    def __init__(self, buy_price=0.15, sell_price=0.10, max_import=50.0, max_export=50.0):
        self.buy_price = buy_price  # TND/kWh
        self.sell_price = sell_price  # TND/kWh
        self.max_import = max_import  # kW
        self.max_export = max_export  # kW
        
        self.total_import = 0
        self.total_export = 0
        self.total_cost = 0
        self.total_revenue = 0
    
    def import_energy(self, energy_kwh, dt=1.0):
        """Import energy from grid"""
        # Apply import limit
        max_import_energy = self.max_import * dt
        actual_import = min(energy_kwh, max_import_energy)
        
        # Calculate cost
        cost = actual_import * self.buy_price
        
        # Update totals
        self.total_import += actual_import
        self.total_cost += cost
        
        return actual_import, cost
    
    def export_energy(self, energy_kwh, dt=1.0):
        """Export energy to grid"""
        # Apply export limit
        max_export_energy = self.max_export * dt
        actual_export = min(energy_kwh, max_export_energy)
        
        # Calculate revenue
        revenue = actual_export * self.sell_price
        
        # Update totals
        self.total_export += actual_export
        self.total_revenue += revenue
        
        return actual_export, revenue
    
    def get_net_cost(self):
        """Get net cost (cost - revenue)"""
        return self.total_cost - self.total_revenue
    
    def get_statistics(self):
        """Get grid statistics"""
        return {
            'total_import_kwh': self.total_import,
            'total_export_kwh': self.total_export,
            'total_cost': self.total_cost,
            'total_revenue': self.total_revenue,
            'net_cost': self.get_net_cost()
        }
    
    def reset(self):
        """Reset statistics"""
        self.total_import = 0
        self.total_export = 0
        self.total_cost = 0
        self.total_revenue = 0
