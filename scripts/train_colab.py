#!/usr/bin/env python3
"""
Google Colab Training Script
Copy this into Google Colab cells to train models
"""

# ============================================================================
# CELL 1: Install Dependencies
# ============================================================================
"""
!pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
!pip install prophet pandas numpy scikit-learn stable-baselines3[extra] gym
!pip install matplotlib seaborn
"""

# ============================================================================
# CELL 2: Mount Google Drive (Optional)
# ============================================================================
"""
from google.colab import drive
drive.mount('/content/drive')
"""

# ============================================================================
# CELL 3: Upload Data
# ============================================================================
"""
from google.colab import files
uploaded = files.upload()
# Or load from Drive:
# import pandas as pd
# data = pd.read_csv('/content/drive/MyDrive/PES/data/processed/synthetic/community_90days.csv')
"""

# ============================================================================
# CELL 4: Load and Prepare Data
# ============================================================================
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

# Load data
data = pd.read_csv('community_90days.csv')  # Or use uploaded file name

print(f"Data shape: {data.shape}")
print(f"Columns: {data.columns.tolist()}")
data.head()
"""

# ============================================================================
# CELL 5: Train LSTM Model
# ============================================================================
"""
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import matplotlib.pyplot as plt

# LSTM Model Definition
class SolarLSTM(nn.Module):
    def __init__(self, input_size=10, hidden_size=64, num_layers=2, output_size=1):
        super(SolarLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )
        self.fc = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

class SolarDataset(Dataset):
    def __init__(self, data, sequence_length=24):
        self.data = data
        self.sequence_length = sequence_length
    
    def __len__(self):
        return len(self.data) - self.sequence_length
    
    def __getitem__(self, idx):
        x = self.data[idx:idx + self.sequence_length, :-1]
        y = self.data[idx + self.sequence_length, -1]
        return torch.FloatTensor(x), torch.FloatTensor([y])

# Prepare data
feature_cols = ['temperature_c', 'cloud_cover_pct', 'humidity_pct', 'wind_speed_kmh', 'production_kwh']
available_cols = [col for col in feature_cols if col in data.columns]

if 'house_id' in data.columns:
    data_agg = data.groupby('timestamp').agg({
        col: 'mean' if col in ['temperature_c', 'cloud_cover_pct', 'humidity_pct', 'wind_speed_kmh'] else 'sum'
        for col in available_cols
    }).reset_index()
    data_values = data_agg[available_cols].values
else:
    data_values = data[available_cols].values

scaler = StandardScaler()
data_scaled = scaler.fit_transform(data_values)

split_idx = int(len(data_scaled) * 0.8)
train_data = data_scaled[:split_idx]
test_data = data_scaled[split_idx:]

# Training
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"Using device: {device}")

input_size = train_data.shape[1] - 1
train_dataset = SolarDataset(train_data)
test_dataset = SolarDataset(test_data)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=32)

model = SolarLSTM(input_size, 64, 2).to(device)
criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

train_losses = []
val_losses = []

for epoch in range(50):
    model.train()
    train_loss = 0
    for batch_x, batch_y in train_loader:
        batch_x, batch_y = batch_x.to(device), batch_y.to(device)
        optimizer.zero_grad()
        outputs = model(batch_x)
        loss = criterion(outputs, batch_y)
        loss.backward()
        optimizer.step()
        train_loss += loss.item()
    
    model.eval()
    val_loss = 0
    with torch.no_grad():
        for batch_x, batch_y in test_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            val_loss += loss.item()
    
    train_loss /= len(train_loader)
    val_loss /= len(test_loader)
    train_losses.append(train_loss)
    val_losses.append(val_loss)
    
    if (epoch + 1) % 10 == 0:
        print(f'Epoch [{epoch+1}/50], Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}')

torch.save(model.state_dict(), 'best_lstm.pth')
print("✅ LSTM model saved as best_lstm.pth")

# Plot
plt.figure(figsize=(10, 5))
plt.plot(train_losses, label='Train Loss')
plt.plot(val_losses, label='Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('LSTM Training Progress')
plt.legend()
plt.grid(True)
plt.show()
"""

# ============================================================================
# CELL 6: Train Prophet Model
# ============================================================================
"""
from prophet import Prophet
import pickle

if 'timestamp' in data.columns:
    if 'house_id' in data.columns:
        community = data.groupby('timestamp').agg({
            'production_kwh': 'sum',
            'temperature_c': 'mean' if 'temperature_c' in data.columns else 'first',
            'cloud_cover_pct': 'mean' if 'cloud_cover_pct' in data.columns else 'first'
        }).reset_index()
    else:
        community = data.copy()
    
    prophet_data = community[['timestamp', 'production_kwh']].copy()
    prophet_data.columns = ['ds', 'y']
    prophet_data['ds'] = pd.to_datetime(prophet_data['ds'])
    
    model_prophet = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=True,
        changepoint_prior_scale=0.05
    )
    
    if 'temperature_c' in community.columns:
        prophet_data['temperature'] = community['temperature_c'].values
        model_prophet.add_regressor('temperature')
    
    if 'cloud_cover_pct' in community.columns:
        prophet_data['cloud_cover'] = community['cloud_cover_pct'].values / 100.0
        model_prophet.add_regressor('cloud_cover')
    
    print("🤖 Training Prophet model...")
    model_prophet.fit(prophet_data)
    
    with open('prophet_model.pkl', 'wb') as f:
        pickle.dump(model_prophet, f)
    
    print("✅ Prophet model saved as prophet_model.pkl")
    
    # Test forecast
    future = model_prophet.make_future_dataframe(periods=24, freq='H')
    forecast = model_prophet.predict(future)
    print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(24))
else:
    print("⚠️ No timestamp column found")
"""

# ============================================================================
# CELL 7: Download Models
# ============================================================================
"""
from google.colab import files

files.download('best_lstm.pth')
files.download('prophet_model.pkl')

print("✅ Models downloaded!")
print("Place them in: models/ directory in your local project")
"""

