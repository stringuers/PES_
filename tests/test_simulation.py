"""
Test Simulation Module
"""

import pytest
import numpy as np
from src.simulation.battery import BatterySystem
from src.simulation.grid import GridConnection
from src.simulation.physics import SolarPhysics
from src.simulation.environment import SolarEnvironment


class TestBatterySystem:
    """Test battery simulation"""
    
    def test_battery_initialization(self):
        """Test battery creation"""
        battery = BatterySystem(capacity_kwh=10.0)
        
        assert battery.capacity == 10.0
        assert battery.current_charge == 5.0  # 50% initial
    
    def test_battery_charge(self):
        """Test battery charging"""
        battery = BatterySystem(capacity_kwh=10.0)
        initial_charge = battery.current_charge
        
        charged = battery.charge(2.0)
        
        assert battery.current_charge > initial_charge
        assert charged > 0
    
    def test_battery_discharge(self):
        """Test battery discharging"""
        battery = BatterySystem(capacity_kwh=10.0)
        initial_charge = battery.current_charge
        
        discharged = battery.discharge(1.0)
        
        assert battery.current_charge < initial_charge
        assert discharged > 0
    
    def test_state_of_charge(self):
        """Test SOC calculation"""
        battery = BatterySystem(capacity_kwh=10.0)
        
        soc = battery.get_state_of_charge()
        assert 0 <= soc <= 100


class TestGridConnection:
    """Test grid connection"""
    
    def test_grid_initialization(self):
        """Test grid creation"""
        grid = GridConnection(buy_price=0.15, sell_price=0.10)
        
        assert grid.buy_price == 0.15
        assert grid.sell_price == 0.10
    
    def test_import_energy(self):
        """Test grid import"""
        grid = GridConnection()
        
        imported, cost = grid.import_energy(5.0)
        
        assert imported == 5.0
        assert cost > 0
        assert grid.total_import == 5.0
    
    def test_export_energy(self):
        """Test grid export"""
        grid = GridConnection()
        
        exported, revenue = grid.export_energy(3.0)
        
        assert exported == 3.0
        assert revenue > 0
        assert grid.total_export == 3.0


class TestSolarPhysics:
    """Test solar physics"""
    
    def test_physics_initialization(self):
        """Test physics creation"""
        physics = SolarPhysics(panel_area_m2=25.0, panel_efficiency=0.18)
        
        assert physics.panel_area == 25.0
        assert physics.panel_efficiency == 0.18
    
    def test_irradiance_calculation(self):
        """Test irradiance calculation"""
        physics = SolarPhysics()
        
        # Noon in summer
        irradiance = physics.calculate_irradiance(hour=12, day_of_year=172)
        assert irradiance > 0
        
        # Midnight
        irradiance = physics.calculate_irradiance(hour=0, day_of_year=172)
        assert irradiance == 0
    
    def test_power_calculation(self):
        """Test power output"""
        physics = SolarPhysics()
        
        power = physics.calculate_power(irradiance=1000, temperature=25)
        assert power > 0


class TestSolarEnvironment:
    """Test complete environment"""
    
    def test_environment_initialization(self):
        """Test environment creation"""
        env = SolarEnvironment(num_houses=5)
        
        assert env.num_houses == 5
        assert len(env.batteries) == 5
        assert len(env.grids) == 5
    
    def test_environment_step(self):
        """Test environment simulation step"""
        env = SolarEnvironment(num_houses=3)
        
        consumptions = [2.0, 2.5, 3.0]
        results = env.step(consumptions)
        
        assert len(results) == 3
        assert all('production' in r for r in results)
        assert all('consumption' in r for r in results)
