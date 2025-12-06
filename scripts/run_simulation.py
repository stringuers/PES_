#!/usr/bin/env python3
"""
Run Simulation Script
Execute solar swarm simulation with custom parameters
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import argparse
import pandas as pd
from pathlib import Path

from src.agents.base_agent import SwarmSimulator
from src.utils.metrics import PerformanceEvaluator
from src.utils.logger import logger


def run_simulation(num_agents=50, hours=24, save_results=True):
    """Run swarm simulation"""
    
    logger.info("="*60)
    logger.info("🐝 SOLAR SWARM SIMULATION")
    logger.info("="*60)
    logger.info(f"Agents: {num_agents}")
    logger.info(f"Duration: {hours} hours")
    logger.info("="*60)
    
    # Create simulator
    simulator = SwarmSimulator(num_agents=num_agents)
    
    # Run simulation
    logger.info("🚀 Starting simulation...")
    results = simulator.run(hours=hours)
    
    # Evaluate performance
    evaluator = PerformanceEvaluator()
    
    sim_results = {
        'production': [a.production for a in simulator.agents] * hours,
        'consumption': [a.consumption for a in simulator.agents] * hours,
        'solar_used': results['solar_used'],
        'grid_import': results['grid_import'],
        'energy_shared': results['shared_energy']
    }
    
    # Generate report
    report = evaluator.generate_report(sim_results)
    print(report)
    
    # Save results
    if save_results:
        results_df = pd.DataFrame({
            'hour': range(len(results['solar_used'])),
            'solar_used': results['solar_used'],
            'grid_import': results['grid_import'],
            'energy_shared': results['shared_energy']
        })
        
        output_path = Path('results/simulation_results.csv')
        output_path.parent.mkdir(parents=True, exist_ok=True)
        results_df.to_csv(output_path, index=False)
        
        logger.info(f"💾 Results saved to {output_path}")
    
    logger.info("="*60)
    logger.info("✅ Simulation complete!")
    logger.info("="*60)
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Run Solar Swarm Simulation")
    parser.add_argument('--agents', type=int, default=50, 
                       help='Number of agents (default: 50)')
    parser.add_argument('--hours', type=int, default=24,
                       help='Simulation hours (default: 24)')
    parser.add_argument('--no-save', action='store_true',
                       help='Do not save results to file')
    
    args = parser.parse_args()
    
    # Validate inputs
    if args.agents < 1 or args.agents > 100:
        logger.error("❌ Number of agents must be between 1 and 100")
        sys.exit(1)
    
    if args.hours < 1 or args.hours > 168:
        logger.error("❌ Hours must be between 1 and 168 (1 week)")
        sys.exit(1)
    
    # Run simulation
    results = run_simulation(
        num_agents=args.agents,
        hours=args.hours,
        save_results=not args.no_save
    )


if __name__ == "__main__":
    main()
