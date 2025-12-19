# 🚀 Quick Start: Train Models on Google Colab

## ✅ Yes! You can train models on Google Colab

Colab is **perfect** for training because:
- 🆓 **Free GPU** (T4) for faster LSTM training
- ⚡ **No local resource usage**
- 📊 **Easy visualization**
- 💾 **Simple download**

## 📋 Step-by-Step Guide

### 1. Open Google Colab
Go to: https://colab.research.google.com/

### 2. Create New Notebook
- Click "New Notebook"
- Or upload: Copy code from `scripts/train_colab.py`

### 3. Enable GPU
```
Runtime → Change runtime type → GPU (T4)
```

### 4. Run These Cells (in order):

#### **Cell 1: Install Packages**
```python
!pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
!pip install prophet pandas numpy scikit-learn stable-baselines3[extra] gym
!pip install matplotlib seaborn
```

#### **Cell 2: Upload Data**
```python
from google.colab import files
uploaded = files.upload()
# Upload your community_90days.csv file
```

#### **Cell 3: Load Data**
```python
import pandas as pd
data = pd.read_csv('community_90days.csv')  # Use your uploaded filename
print(data.head())
```

#### **Cell 4: Train LSTM** (Copy from `scripts/train_colab.py` - CELL 5)
- This will use GPU automatically
- Takes ~5-10 minutes
- Saves: `best_lstm.pth`

#### **Cell 5: Train Prophet** (Copy from `scripts/train_colab.py` - CELL 6)
- Takes ~2-5 minutes
- Saves: `prophet_model.pkl`

#### **Cell 6: Download Models**
```python
from google.colab import files
files.download('best_lstm.pth')
files.download('prophet_model.pkl')
```

### 5. Save Models Locally

After downloading:
```bash
# In your local project
mkdir -p models
# Move downloaded files to models/ directory
mv ~/Downloads/best_lstm.pth models/
mv ~/Downloads/prophet_model.pkl models/
```

## 📁 File Reference

The complete training code is in:
- **`scripts/train_colab.py`** - Copy cells from here
- **`COLAB_GUIDE.md`** - Detailed guide

## ⏱️ Training Times

- **LSTM**: 5-10 min (with GPU) ⚡
- **Prophet**: 2-5 min
- **PPO**: 20-30 min (optional)

## 🎯 What You Get

After training:
- ✅ `best_lstm.pth` - LSTM forecasting model
- ✅ `prophet_model.pkl` - Prophet forecasting model
- ✅ Training plots and metrics

## 💡 Pro Tips

1. **GPU Check**: Run `!nvidia-smi` to verify GPU
2. **Save to Drive**: Instead of downloading, save to Drive for backup
3. **Resume Training**: Colab sessions last 12 hours - plenty of time!

## 🔗 Next Steps

After downloading models:
1. Place in `models/` directory
2. Start API: `python main.py api`
3. Test: `curl http://localhost:8000/api/v1/forecast/24h`
4. Should show `"model_type": "LSTM"` or `"PROPHET"`

Happy training! 🚀


