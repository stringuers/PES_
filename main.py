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
        
        # Check if data exists
        data_path = Path('data/processed/synthetic/community_90days.csv')
        if not data_path.exists():
            logger.error("❌ Training data not found!")
            logger.info("📊 Generating training data first...")
            from src.data_collection.generate_synthetic import SyntheticDataGenerator
            generator = SyntheticDataGenerator(num_houses=50, days=90)
            generator.save_dataset()
            logger.info("✅ Training data generated!")
        
        models_trained = []
        
        # Train LSTM
        if args.model in ['lstm', 'all']:
            try:
                logger.info("🤖 Training LSTM forecaster...")
                import pandas as pd
                import numpy as np
                from src.models.lstm_forecaster import train_lstm_model
                
                # Load data
                df = pd.read_csv(data_path)
                
                # Prepare features
                feature_cols = ['temperature_c', 'cloud_cover_pct', 'humidity_pct', 
                               'wind_speed_kmh', 'production_kwh']
                
                # Check if columns exist
                missing_cols = [col for col in feature_cols if col not in df.columns]
                if missing_cols:
                    logger.warning(f"⚠️ Missing columns: {missing_cols}, using available columns")
                    feature_cols = [col for col in feature_cols if col in df.columns]
                
                # Train/test split
                split_idx = int(len(df) * 0.8)
                train_data = df[feature_cols].values[:split_idx]
                test_data = df[feature_cols].values[split_idx:]
                
                # Train model
                model = train_lstm_model(train_data, test_data, epochs=50)
                models_trained.append('LSTM')
                logger.info("✅ LSTM training complete")
            except Exception as e:
                logger.error(f"❌ LSTM training failed: {e}", exc_info=True)
        
        # Train Prophet
        if args.model in ['prophet', 'all']:
            try:
                logger.info("🤖 Training Prophet forecaster...")
                import pandas as pd
                from src.models.forecasting import SolarForecaster
                
                # Load data
                df = pd.read_csv(data_path)
                
                # Aggregate by timestamp for community-level forecast
                if 'timestamp' in df.columns:
                    community = df.groupby('timestamp').agg({
                        'production_kwh': 'sum',
                        'temperature_c': 'mean' if 'temperature_c' in df.columns else 'first',
                        'cloud_cover_pct': 'mean' if 'cloud_cover_pct' in df.columns else 'first'
                    }).reset_index()
                    
                    # Prepare Prophet data - need DataFrame with 'timestamp' and 'production_kwh'
                    # SolarForecaster.prepare_data expects 'timestamp' and 'production_kwh'
                    # Train Prophet
                    forecaster = SolarForecaster()
                    forecaster.train(community)
                    
                    # Save model
                    import pickle
                    Path('models').mkdir(exist_ok=True)
                    with open('models/prophet_model.pkl', 'wb') as f:
                        pickle.dump(forecaster.model, f)
                    
                    models_trained.append('Prophet')
                    logger.info("✅ Prophet training complete")
                else:
                    logger.warning("⚠️ No timestamp column found, skipping Prophet training")
            except Exception as e:
                logger.error(f"❌ Prophet training failed: {e}", exc_info=True)
        
        # Train PPO
        if args.model in ['ppo', 'all']:
            try:
                logger.info("🤖 Training PPO agents...")
                from src.agents.rl_agent import train_rl_agents
                
                # Train PPO (this may take a while)
                model = train_rl_agents(total_timesteps=100000)
                models_trained.append('PPO')
                logger.info("✅ PPO training complete")
            except Exception as e:
                logger.error(f"❌ PPO training failed: {e}", exc_info=True)
        
        logger.info("=" * 60)
        if models_trained:
            logger.info(f"✅ Training complete! Models trained: {', '.join(models_trained)}")
        else:
            logger.warning("⚠️ No models were successfully trained")
        logger.info("=" * 60)
    
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
