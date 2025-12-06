import pytest
from src.simulation import SwarmSimulator

class TestSwarmScenarios:
    """
    Test various scenarios to validate system behavior
    """
    
    def test_sunny_day_scenario(self):
        """
        Scenario: Perfect sunny day, high production
        Expected: High solar usage (>85%), minimal grid import
        """
        simulator = SwarmSimulator(num_agents=50)
        
        # Override weather: sunny all day
        simulator.set_weather('sunny', cloud_cover=0)
        
        results = simulator.run(hours=24)
        
        assert results['solar_usage_pct'] > 85
        assert results['grid_import_pct'] < 15
        print("✅ Sunny day scenario passed")
    
    def test_cloudy_day_scenario(self):
        """
        Scenario: Cloudy day with intermittent production
        Expected: Swarm adapts, uses batteries effectively
        """
        simulator = SwarmSimulator(num_agents=50)
        
        # Override weather: cloudy
        simulator.set_weather('cloudy', cloud_cover=80)
        
        results = simulator.run(hours=24)
        
        # Should still perform better than baseline
        assert results['solar_usage_pct'] > 60
        assert results['battery_utilization'] > 70
        print("✅ Cloudy day scenario passed")
    
    def test_panel_failure_scenario(self):
        """
        Scenario: 5 panels fail during operation
        Expected: System adapts, neighbors compensate
        """
        simulator = SwarmSimulator(num_agents=50)
        
        # Run for 12 hours
        simulator.run(hours=12)
        
        # Simulate 5 panel failures
        for i in range(5):
            simulator.agents[i].production = 0
            simulator.agents[i].status = 'failed'
        
        # Continue for 12 more hours
        results = simulator.run(hours=12, reset=False)
        
        # System should maintain reasonable performance
        assert results['solar_usage_pct'] > 70
        print("✅ Panel failure scenario passed")
    
    def test_peak_demand_scenario(self):
        """
        Scenario: Evening peak demand (all homes high consumption)
        Expected: Swarm uses stored energy efficiently
        """
        simulator = SwarmSimulator(num_agents=50)
        
        # Set all agents to high consumption
        for agent in simulator.agents:
            agent.consumption_multiplier = 2.0
        
        results = simulator.run(hours=24)
        
        # Should handle peak demand
        assert results['grid_import_pct'] < 30
        print("✅ Peak demand scenario passed")
    
    def test_swarm_vs_individual(self):
        """
        Compare swarm optimization vs individual optimization
        Expected: Swarm performs 20%+ better
        """
        # Swarm mode
        simulator_swarm = SwarmSimulator(num_agents=50, mode='swarm')
        results_swarm = simulator_swarm.run(hours=24)
        
        # Individual mode (no sharing)
        simulator_individual = SwarmSimulator(num_agents=50, mode='individual')
        results_individual = simulator_individual.run(hours=24)
        
        improvement = (
            (results_swarm['solar_usage_pct'] - results_individual['solar_usage_pct']) /
            results_individual['solar_usage_pct']
        ) * 100
        
        assert improvement > 20
        print(f"✅ Swarm vs Individual: {improvement:.1f}% improvement")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, '-v'])