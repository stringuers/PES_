import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error

class PerformanceEvaluator:
    """
    Calculate and track system performance metrics
    """
    
    def __init__(self):
        self.metrics_history = []
    
    def evaluate_forecasting(self, y_true, y_pred):
        """
        Evaluate forecasting model accuracy
        """
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mae = mean_absolute_error(y_true, y_pred)
        mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
        
        return {
            'RMSE': rmse,
            'MAE': mae,
            'MAPE': mape
        }
    
    def evaluate_anomaly_detection(self, y_true, y_pred):
        """
        Evaluate anomaly detection performance
        """
        from sklearn.metrics import precision_score, recall_score, f1_score
        
        return {
            'Precision': precision_score(y_true, y_pred),
            'Recall': recall_score(y_true, y_pred),
            'F1-Score': f1_score(y_true, y_pred)
        }
    
    def calculate_energy_metrics(self, simulation_results):
        """
        Calculate energy-related KPIs
        """
        total_production = sum(simulation_results.get('production', [0]) or [0])
        total_consumption = sum(simulation_results.get('consumption', [0]) or [0])
        solar_used = sum(simulation_results.get('solar_used', [0]) or [0])
        grid_import = sum(simulation_results.get('grid_import', [0]) or [0])
        energy_shared = sum(simulation_results.get('energy_shared', [0]) or [0])
        
        # Prevent division by zero - check BEFORE dividing
        if total_production > 0:
            solar_utilization_pct = (solar_used / total_production) * 100
            sharing_efficiency = (energy_shared / total_production) * 100
        else:
            solar_utilization_pct = 0.0
            sharing_efficiency = 0.0
        
        if total_consumption > 0:
            self_sufficiency_pct = ((total_consumption - grid_import) / total_consumption) * 100
            grid_dependency_pct = (grid_import / total_consumption) * 100
        else:
            self_sufficiency_pct = 0.0
            grid_dependency_pct = 0.0
        
        metrics = {
            'solar_utilization_pct': solar_utilization_pct,
            'self_sufficiency_pct': self_sufficiency_pct,
            'sharing_efficiency': sharing_efficiency,
            'grid_dependency_pct': grid_dependency_pct
        }
        
        return metrics
    
    def calculate_economic_metrics(self, simulation_results, grid_price=0.15):
        """
        Calculate cost savings and economic benefits
        """
        grid_import_kwh = sum(simulation_results.get('grid_import', [0]))
        solar_used_kwh = sum(simulation_results.get('solar_used', [0]))
        total_consumption = sum(simulation_results.get('consumption', [0]))
        
        # Cost with swarm system
        cost_with_swarm = grid_import_kwh * grid_price
        
        # Cost without swarm (baseline: 40% grid dependency)
        baseline_grid_import = total_consumption * 0.4
        cost_baseline = baseline_grid_import * grid_price
        
        savings = cost_baseline - cost_with_swarm
        savings_pct = (savings / cost_baseline * 100) if cost_baseline > 0 else 0.0
        
        return {
            'cost_with_swarm': cost_with_swarm,
            'cost_baseline': cost_baseline,
            'daily_savings': savings,
            'monthly_savings': savings * 30,
            'annual_savings': savings * 365,
            'savings_percentage': savings_pct
        }
    
    def calculate_environmental_impact(self, simulation_results):
        """
        Calculate CO2 emissions avoided
        """
        # Grid electricity CO2 intensity (Tunisia: ~0.5 kg CO2/kWh)
        co2_intensity = 0.5
        
        grid_import_kwh = sum(simulation_results.get('grid_import', [0]))
        total_consumption = sum(simulation_results.get('consumption', [0]))
        baseline_grid_import = total_consumption * 0.4
        
        co2_avoided_kg = (baseline_grid_import - grid_import_kwh) * co2_intensity
        co2_avoided_tons = co2_avoided_kg / 1000
        
        # Tree equivalent (1 tree absorbs ~21 kg CO2/year)
        trees_equivalent = co2_avoided_kg * 365 / 21
        
        return {
            'daily_co2_avoided_kg': co2_avoided_kg,
            'monthly_co2_avoided_kg': co2_avoided_kg * 30,
            'annual_co2_avoided_tons': co2_avoided_tons * 365,
            'trees_equivalent': trees_equivalent
        }
    
    def generate_report(self, simulation_results):
        """
        Generate comprehensive performance report
        """
        energy_metrics = self.calculate_energy_metrics(simulation_results)
        economic_metrics = self.calculate_economic_metrics(simulation_results)
        environmental_metrics = self.calculate_environmental_impact(simulation_results)
        
        report = f"""
========================================
SOLAR SWARM INTELLIGENCE - PERFORMANCE REPORT
========================================

ENERGY METRICS:
--------------
Solar Utilization:      {energy_metrics['solar_utilization_pct']:.1f}%
Self-Sufficiency:       {energy_metrics['self_sufficiency_pct']:.1f}%
Grid Dependency:        {energy_metrics['grid_dependency_pct']:.1f}%
Energy Sharing:         {energy_metrics['sharing_efficiency']:.1f}%

ECONOMIC IMPACT:
---------------
Daily Savings:          ${economic_metrics['daily_savings']:.2f}
Monthly Savings:        ${economic_metrics['monthly_savings']:.2f}
Annual Savings:         ${economic_metrics['annual_savings']:.2f}
Savings Percentage:     {economic_metrics['savings_percentage']:.1f}%

ENVIRONMENTAL IMPACT:
--------------------
Daily CO₂ Avoided:      {environmental_metrics['daily_co2_avoided_kg']:.1f} kg
Monthly CO₂ Avoided:    {environmental_metrics['monthly_co2_avoided_kg']:.1f} kg
Annual CO₂ Avoided:     {environmental_metrics['annual_co2_avoided_tons']:.2f} tons
Trees Equivalent:       {environmental_metrics['trees_equivalent']:.0f} trees

========================================
        """
        
        return report