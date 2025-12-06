import requests
import pandas as pd
from datetime import datetime, timedelta

def fetch_pvgis_data(latitude, longitude, year):
    """
    Fetch solar irradiance data from PVGIS for Tunisia
    
    Parameters:
    - latitude: 35.8245 (Sousse, Tunisia)
    - longitude: 10.6346
    - year: 2024
    """
    
    url = "https://re.jrc.ec.europa.eu/api/seriescalc"
    
    params = {
        'lat': latitude,
        'lon': longitude,
        'startyear': year,
        'endyear': year,
        'pvcalculation': 1,
        'peakpower': 5,  # 5 kW system
        'loss': 14,      # 14% system losses
        'outputformat': 'json'
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        # Process and return as DataFrame
        df = pd.DataFrame(data['outputs']['hourly'])
        df['timestamp'] = pd.to_datetime(df[['year', 'month', 'day', 'hour']])
        return df
    else:
        raise Exception(f"API request failed: {response.status_code}")

def fetch_weather_forecast(api_key, lat, lon):
    """
    Fetch weather forecast from OpenWeatherMap
    """
    url = "https://api.openweathermap.org/data/2.5/forecast"
    
    params = {
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': 'metric'
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    # Extract relevant features
    forecasts = []
    for item in data['list']:
        forecasts.append({
            'timestamp': item['dt'],
            'temperature': item['main']['temp'],
            'clouds': item['clouds']['all'],
            'humidity': item['main']['humidity'],
            'wind_speed': item['wind']['speed']
        })
    
    return pd.DataFrame(forecasts)

# Usage
if __name__ == "__main__":
    # Sousse, Tunisia coordinates
    LAT, LON = 35.8245, 10.6346
    
    # Fetch solar data
    solar_data = fetch_pvgis_data(LAT, LON, 2024)
    solar_data.to_csv('data/raw/solar_tunisia_2024.csv', index=False)
    
    # Fetch weather data
    API_KEY = "your_openweathermap_api_key"
    weather_data = fetch_weather_forecast(API_KEY, LAT, LON)
    weather_data.to_csv('data/raw/weather_sousse.csv', index=False)
    
    print("✅ Data collection complete!")