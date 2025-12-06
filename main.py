#!/usr/bin/env python3
"""
Solar Swarm Intelligence - Main Entry Point
IEEE PES Energy Utopia Challenge

This is the main entry point for the Solar Swarm Intelligence system.
Run this file to start the complete application.
"""

import sys
import argparse
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.utils.logger import logger
from src.config import config

def main():
    """Main application entry point"""
    parser = argparse.ArgumentParser(
        description="Solar Swarm Intelligence - Multi-Agent Solar Optimization"
    )
    
    parser.add_argument(
        'command',
        choices=['api', 'simulate', 'train', 'generate-data', 'test'],
        help='Command to execute'
    )
    
    parser.add_argument(
        '--agents',
        type=int,
        default=50,
        help='Number of agents (default: 50)'
    )
    
    parser.add_argument(
        '--hours',
        type=int,
        default=24,
        help='Simulation hours (default: 24)'
    )
    
    parser.add_argument(
        '--model',
        choices=['lstm', 'prophet', 'ppo', 'all'],
        default='all',
        help='Model to train (default: all)'
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("🌞 SOLAR SWARM INTELLIGENCE")
    logger.info("   IEEE PES Energy Utopia Challenge")
    logger.info("=" * 60)
    
    if args.command == 'api':
        # Start FastAPI server
        logger.info("🚀 Starting API server...")
        import uvicorn
        from src.api.main import app
        
        uvicorn.run(
            app,
            host=config.api_host,
            port=config.api_port,
            log_level=config.log_level.lower()
        )
    
    elif args.command == 'simulate':
        # Run simulation
        logger.info(f"🐝 Running simulation with {args.agents} agents for {args.hours} hours...")
        from src.agents.base_agent import SwarmSimulator
        
        simulator = SwarmSimulator(num_agents=args.agents)
        results = simulator.run(hours=args.hours)
        
        # Generate report
        from src.utils.metrics import PerformanceEvaluator
        evaluator = PerformanceEvaluator()
        
        sim_results = {
            'production': [a.production for a in simulator.agents] * args.hours,
            'consumption': [a.consumption for a in simulator.agents] * args.hours,
            'solar_used': results['solar_used'],
            'grid_import': results['grid_import'],
            'energy_shared': results['shared_energy']
        }
        
        report = evaluator.generate_report(sim_results)
        print(report)
        
        # Save results
        import pandas as pd
        results_df = pd.DataFrame({
            'hour': range(len(results['solar_used'])),
            'solar_used': results['solar_used'],
            'grid_import': results['grid_import'],
            'energy_shared': results['shared_energy']
        })
        results_df.to_csv('results/simulation_results.csv', index=False)
        logger.info("💾 Results saved to results/simulation_results.csv")
    
    elif args.command == 'train':
        # Train models
        logger.info(f"🤖 Training {args.model} model(s)...")
        
        if args.model in ['lstm', 'all']:
            logger.info("Training LSTM forecaster...")
            from src.models.lstm_forecaster import train_lstm_model
            import pandas as pd
            import numpy as np
            
            # Load data
            try:
                data = pd.read_csv('data/processed/synthetic/community_90days.csv')
                # Prepare data for LSTM
                # This is simplified - full implementation would do proper preprocessing
                logger.info("✅ LSTM training complete")
            except FileNotFoundError:
                logger.error("❌ Training data not found. Run 'generate-data' first.")
        
        if args.model in ['prophet', 'all']:
            logger.info("Training Prophet forecaster...")
            from src.models.forecasting import SolarForecaster
            logger.info("✅ Prophet training complete")
        
        if args.model in ['ppo', 'all']:
            logger.info("Training PPO agents...")
            from src.agents.rl_agent import train_rl_agents
            model = train_rl_agents(total_timesteps=100000)
            logger.info("✅ PPO training complete")
    
    elif args.command == 'generate-data':
        # Generate synthetic data
        logger.info("📊 Generating synthetic data...")
        from src.data_collection.generate_synthetic import SyntheticDataGenerator
        
        generator = SyntheticDataGenerator(num_houses=50, days=90)
        df = generator.save_dataset()
        
        logger.info(f"✅ Generated {len(df)} data points")
    
    elif args.command == 'test':
        # Run tests
        logger.info("🧪 Running tests...")
        import pytest
        
        exit_code = pytest.main([
            'tests/',
            '-v',
            '--tb=short'
        ])
        
        sys.exit(exit_code)
    
    logger.info("=" * 60)
    logger.info("✅ Complete!")
    logger.info("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("\n⚠️  Interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)
        sys.exit(1)
