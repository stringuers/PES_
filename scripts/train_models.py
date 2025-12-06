#!/usr/bin/env python3
"""
Train Models Script
Train all ML models for the Solar Swarm Intelligence system
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import argparse
import pandas as pd
import numpy as np
from pathlib import Path

from src.models.lstm_forecaster import train_lstm_model
from src.models.forecasting import SolarForecaster
from src.agents.rl_agent import train_rl_agents
from src.utils.logger import logger


def train_lstm(data_path, epochs=50):
    """Train LSTM forecasting model"""
    logger.info("🤖 Training LSTM model...")
    
    # Load data
    df = pd.read_csv(data_path)
    
    # Prepare features
    feature_cols = ['temperature_c', 'cloud_cover_pct', 'humidity_pct', 
                   'wind_speed_kmh', 'production_kwh']
    
    # Train/test split
    split_idx = int(len(df) * 0.8)
    train_data = df[feature_cols].values[:split_idx]
    test_data = df[feature_cols].values[split_idx:]
    
    # Train model
    model = train_lstm_model(train_data, test_data, epochs=epochs)
    
    logger.info("✅ LSTM model trained successfully")
    return model


def train_prophet(data_path):
    """Train Prophet forecasting model"""
    logger.info("🤖 Training Prophet model...")
    
    # Load data
    df = pd.read_csv(data_path)
    
    # Aggregate by timestamp
    community = df.groupby('timestamp').agg({
        'production_kwh': 'sum',
        'temperature_c': 'mean',
        'cloud_cover_pct': 'mean'
    }).reset_index()
    
    # Train Prophet
    forecaster = SolarForecaster(model_type='prophet')
    forecaster.train(community)
    
    logger.info("✅ Prophet model trained successfully")
    return forecaster


def train_ppo(total_timesteps=100000):
    """Train PPO reinforcement learning agent"""
    logger.info("🤖 Training PPO agent...")
    
    model = train_rl_agents(total_timesteps=total_timesteps)
    
    logger.info("✅ PPO agent trained successfully")
    return model


def main():
    parser = argparse.ArgumentParser(description="Train Solar Swarm Intelligence models")
    parser.add_argument('--model', choices=['lstm', 'prophet', 'ppo', 'all'], 
                       default='all', help='Model to train')
    parser.add_argument('--data', default='data/processed/synthetic/community_90days.csv',
                       help='Path to training data')
    parser.add_argument('--epochs', type=int, default=50, help='Training epochs for LSTM')
    parser.add_argument('--timesteps', type=int, default=100000, help='Timesteps for PPO')
    
    args = parser.parse_args()
    
    logger.info("="*60)
    logger.info("🌞 SOLAR SWARM INTELLIGENCE - MODEL TRAINING")
    logger.info("="*60)
    
    # Check if data exists
    if not Path(args.data).exists():
        logger.error(f"❌ Data file not found: {args.data}")
        logger.info("�� Run: python main.py generate-data")
        sys.exit(1)
    
    models_trained = []
    
    # Train LSTM
    if args.model in ['lstm', 'all']:
        try:
            lstm_model = train_lstm(args.data, epochs=args.epochs)
            models_trained.append('LSTM')
        except Exception as e:
            logger.error(f"❌ LSTM training failed: {e}")
    
    # Train Prophet
    if args.model in ['prophet', 'all']:
        try:
            prophet_model = train_prophet(args.data)
            models_trained.append('Prophet')
        except Exception as e:
            logger.error(f"❌ Prophet training failed: {e}")
    
    # Train PPO
    if args.model in ['ppo', 'all']:
        try:
            ppo_model = train_ppo(total_timesteps=args.timesteps)
            models_trained.append('PPO')
        except Exception as e:
            logger.error(f"❌ PPO training failed: {e}")
    
    logger.info("="*60)
    logger.info(f"✅ Training complete! Models trained: {', '.join(models_trained)}")
    logger.info("="*60)


if __name__ == "__main__":
    main()
