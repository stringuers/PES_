# 🚀 Training Models on Google Colab

Yes! You can absolutely train the models on Google Colab. It's actually **recommended** because:
- ✅ **Free GPU access** (T4 GPU)
- ✅ **No local resource usage**
- ✅ **Faster training** (especially for LSTM and PPO)
- ✅ **Easy to share and reproduce**

## 📋 Quick Start

### Step 1: Open the Colab Notebook

1. Go to [Google Colab](https://colab.research.google.com/)
2. Upload the notebook: `notebooks/train_models_colab.ipynb`
   - Or create a new notebook and copy the cells

### Step 2: Upload Training Data

You need your `community_90days.csv` file:

**Option A: Upload directly in Colab**
- Use the file uploader in the notebook
- Or: `files.upload()` cell

**Option B: Use Google Drive**
- Upload `community_90days.csv` to Google Drive
- Mount Drive in Colab
- Load from Drive path

### Step 3: Run Training Cells

The notebook will:
1. ✅ Install all dependencies
2. ✅ Train LSTM model (with GPU acceleration)
3. ✅ Train Prophet model
4. ✅ Train PPO agent (optional, takes longer)
5. ✅ Download trained models

### Step 4: Download Models

After training, download the models:
- `best_lstm.pth` → Save to `models/best_lstm.pth` locally
- `prophet_model.pkl` → Save to `models/prophet_model.pkl` locally
- `solar_swarm_ppo.zip` → Save to `models/solar_swarm_ppo.zip` locally

## 🎯 What Gets Trained

### 1. LSTM Model
- **Time**: ~5-10 minutes (with GPU)
- **Output**: `best_lstm.pth`
- **Uses**: GPU acceleration for faster training

### 2. Prophet Model
- **Time**: ~2-5 minutes
- **Output**: `prophet_model.pkl`
- **Uses**: CPU (Prophet doesn't use GPU)

### 3. PPO Agent (Optional)
- **Time**: ~20-30 minutes
- **Output**: `solar_swarm_ppo.zip`
- **Uses**: CPU (stable-baselines3)

## 📁 File Structure After Training

```
Your Local Project:
├── models/
│   ├── best_lstm.pth          ← From Colab
│   ├── prophet_model.pkl      ← From Colab
│   └── solar_swarm_ppo.zip    ← From Colab (optional)
```

## 🔧 Setup Instructions

### In Colab Notebook:

1. **Enable GPU** (if not already):
   ```
   Runtime → Change runtime type → GPU (T4)
   ```

2. **Install packages** (first cell):
   ```python
   !pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   !pip install prophet pandas numpy scikit-learn stable-baselines3 gym
   ```

3. **Upload data**:
   ```python
   from google.colab import files
   uploaded = files.upload()
   ```

4. **Run training cells** in order

5. **Download models**:
   ```python
   from google.colab import files
   files.download('best_lstm.pth')
   files.download('prophet_model.pkl')
   ```

## 💡 Tips

### GPU Usage
- **LSTM**: Benefits greatly from GPU (10x faster)
- **Prophet**: CPU only (no GPU support)
- **PPO**: CPU only (stable-baselines3 doesn't use GPU by default)

### Data Size
- Colab can handle large datasets
- If data is >100MB, use Google Drive instead of direct upload

### Saving to Drive
Instead of downloading, you can save directly to Drive:
```python
import shutil
shutil.copy('best_lstm.pth', '/content/drive/MyDrive/PES/models/best_lstm.pth')
```

### Time Limits
- Free Colab: 12-hour session limit
- Training all models: ~30-45 minutes total
- Plenty of time! ✅

## 🐛 Troubleshooting

### "CUDA out of memory"
- Reduce batch size in LSTM training
- Or use CPU: `device = torch.device('cpu')`

### "Module not found"
- Run the install cell again
- Restart runtime: `Runtime → Restart runtime`

### "File not found"
- Check file was uploaded correctly
- Verify filename matches: `community_90days.csv`

## 📊 Expected Results

After training, you should see:
- ✅ LSTM: Training loss decreasing, validation loss stable
- ✅ Prophet: Model fitted successfully
- ✅ PPO: Episode scores increasing over time

## 🎉 After Training

Once models are downloaded:

1. **Place in local project**:
   ```bash
   mkdir -p models
   # Move downloaded files to models/ directory
   ```

2. **Test locally**:
   ```bash
   python main.py api
   # Then test: curl http://localhost:8000/api/v1/forecast/24h
   ```

3. **Verify model loading**:
   - Check API response shows `"model_type": "LSTM"` or `"PROPHET"`
   - If shows `"SIMPLE"`, models aren't loading correctly

## 🔗 Direct Link

You can also open the notebook directly:
- Upload `notebooks/train_models_colab.ipynb` to Colab
- Or create new notebook and copy cells from the file

## 📝 Notebook Features

The Colab notebook includes:
- ✅ Automatic GPU detection
- ✅ Data validation and preprocessing
- ✅ Training progress visualization
- ✅ Model evaluation metrics
- ✅ Easy download/save options

Happy training! 🚀

