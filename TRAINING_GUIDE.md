# 🤖 Model Training Guide

This guide explains how to train the LSTM, Prophet, and PPO models for the Solar Swarm Intelligence system.

## 📋 Prerequisites

1. **Install Dependencies**
   ```bash
   pip install -r requirements.api.txt
   pip install torch torchvision  # For LSTM
   pip install prophet  # For Prophet
   pip install stable-baselines3  # For PPO
   pip install scikit-learn  # For anomaly detection
   ```

2. **Generate Training Data** (if not already done)
   ```bash
   python main.py generate-data
   ```
   This creates `data/processed/synthetic/community_90days.csv` with 90 days of synthetic data for 50 houses.

## 🚀 Training Models

### Option 1: Train All Models (Recommended)

Train all three models at once:
```bash
python main.py train --model all
```

### Option 2: Train Individual Models

**Train LSTM only:**
```bash
python main.py train --model lstm
```

**Train Prophet only:**
```bash
python main.py train --model prophet
```

**Train PPO only:**
```bash
python main.py train --model ppo
```

### Option 3: Using the Training Script Directly

You can also use the dedicated training script with more options:
```bash
python scripts/train_models.py --model all --epochs 50 --timesteps 100000
```

## 📊 What Each Model Does

### 1. **LSTM (Long Short-Term Memory)**
- **Purpose**: Forecasts solar production for the next 24 hours
- **Input**: Historical production, temperature, cloud cover, humidity, wind speed
- **Output**: Predicted production for next 24 hours
- **Saved to**: `models/best_lstm.pth`
- **Training time**: ~5-10 minutes (50 epochs)

### 2. **Prophet**
- **Purpose**: Time series forecasting using Facebook Prophet
- **Input**: Historical production data with timestamps
- **Output**: Forecasted production with confidence intervals
- **Saved to**: `models/prophet_model.pkl`
- **Training time**: ~2-5 minutes

### 3. **PPO (Proximal Policy Optimization)**
- **Purpose**: Reinforcement learning agent for optimal energy decisions
- **Input**: Agent state (battery, production, consumption, neighbors)
- **Output**: Optimal actions (charge, share, sell)
- **Saved to**: `models/solar_swarm_ppo.pth`
- **Training time**: ~10-30 minutes (100,000 timesteps)

## 🔧 Advanced Options

### Custom Training Parameters

**LSTM with custom epochs:**
```bash
python scripts/train_models.py --model lstm --epochs 100
```

**PPO with custom timesteps:**
```bash
python scripts/train_models.py --model ppo --timesteps 200000
```

**Custom data path:**
```bash
python scripts/train_models.py --model all --data data/processed/my_data.csv
```

## 📁 Output Files

After training, models are saved to:
- `models/best_lstm.pth` - LSTM model weights
- `models/prophet_model.pkl` - Prophet model
- `models/solar_swarm_ppo.pth` - PPO agent model

Make sure the `models/` directory exists:
```bash
mkdir -p models
```

## ✅ Verification

After training, verify models are loaded correctly:

1. **Start the API:**
   ```bash
   python main.py api
   ```

2. **Test Forecasting:**
   ```bash
   curl http://localhost:8000/api/v1/forecast/24h
   ```
   Should return forecast data using the trained model.

3. **Check Model Type:**
   The response will show `"model_type": "LSTM"` or `"PROPHET"` if models are loaded, or `"SIMPLE"` if using fallback.

## 🐛 Troubleshooting

### Error: "Training data not found"
**Solution:** Generate data first:
```bash
python main.py generate-data
```

### Error: "Module not found: torch"
**Solution:** Install PyTorch:
```bash
pip install torch torchvision
```

### Error: "Module not found: prophet"
**Solution:** Install Prophet:
```bash
pip install prophet
```

### Error: "Module not found: stable_baselines3"
**Solution:** Install stable-baselines3:
```bash
pip install stable-baselines3
```

### LSTM Training Fails
- Check if you have enough RAM (LSTM training can be memory-intensive)
- Try reducing epochs: `--epochs 20`
- Check if data file has required columns

### Prophet Training Fails
- Ensure data has `timestamp` column
- Check if data has `production_kwh` column
- Verify data is in correct format (CSV)

### PPO Training Takes Too Long
- Reduce timesteps: `--timesteps 50000`
- PPO training is computationally intensive, be patient
- Consider training on GPU if available

## 📈 Training Progress

During training, you'll see:
- **LSTM**: Epoch progress with train/validation loss
- **Prophet**: Model fitting progress
- **PPO**: Episode scores and learning progress

## 🎯 Next Steps

After training:
1. Models are automatically loaded by the forecasting service
2. Use `/api/v1/forecast/24h` to get predictions
3. RL agents can use PPO model for decision making
4. Anomaly detection will train on simulation data automatically

## 💡 Tips

- **First time**: Train all models with default settings
- **Quick test**: Train just Prophet (fastest)
- **Best accuracy**: Train LSTM with more epochs (100+)
- **RL optimization**: Train PPO with more timesteps (200k+)
- **Data quality**: More training data = better models

## 📚 Additional Resources

- LSTM documentation: https://pytorch.org/docs/stable/nn.html#lstm
- Prophet documentation: https://facebook.github.io/prophet/
- PPO documentation: https://stable-baselines3.readthedocs.io/

