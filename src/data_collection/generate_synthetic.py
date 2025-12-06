"""
Synthetic Data Generator
Creates realistic 90-day simulation data for 50 households
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

class SyntheticDataGenerator:
    """
    Generate realistic solar production and consumption data
    """
    
    def __init__(self, num_houses=50, days=90, seed=42):
        self.num_houses = num_houses
        self.days = days
        self.hours = days * 24
        np.random.seed(seed)
        
        # House characteristics
        self.house_profiles = self._generate_house_profiles()
    
    def _generate_house_profiles(self):
        """Generate diverse household profiles"""
        profiles = []
        
        # Distribution: 30% low, 50% medium, 20% high consumers
        consumption_types = np.random.choice(
            ['low', 'medium', 'high'],
            size=self.num_houses,
            p=[0.3, 0.5, 0.2]
        )
        
        for i in range(self.num_houses):
            profile = {
                'house_id': i,
                'consumption_type': consumption_types[i],
                'panel_capacity_kw': np.random.uniform(4.0, 6.0),
                'panel_efficiency': np.random.uniform(0.16, 0.20),
                'panel_orientation': np.random.choice(['south', 'southeast', 'southwest']),
                'battery_capacity_kwh': np.random.uniform(8.0, 12.0),
                'occupants': np.random.randint(1, 6),
                'has_ev': np.random.choice([True, False], p=[0.2, 0.8])
            }
            profiles.append(profile)
        
        return profiles
    
    def generate_solar_production(self, house_id, timestamp):
        """
        Generate realistic solar production for a given hour
        """
        profile = self.house_profiles[house_id]
        hour = timestamp.hour
        day_of_year = timestamp.timetuple().tm_yday
        
        # Base irradiance pattern (sinusoidal)
        if 6 <= hour <= 18:
            # Peak at solar noon (12:00)
            sun_angle = np.sin((hour - 6) * np.pi / 12)
            base_irradiance = 1000 * sun_angle  # W/m²
            
            # Seasonal variation (higher in summer)
            seasonal_factor = 0.8 + 0.4 * np.sin((day_of_year - 80) * 2 * np.pi / 365)
            
            # Weather randomness (clouds, etc.)
            weather_factor = np.random.uniform(0.7, 1.0)
            
            # Orientation impact
            orientation_factors = {
                'south': 1.0,
                'southeast': 0.95,
                'southwest': 0.95
            }
            orientation_factor = orientation_factors[profile['panel_orientation']]
            
            # Calculate production
            irradiance = base_irradiance * seasonal_factor * weather_factor * orientation_factor
            production_kw = (irradiance / 1000) * profile['panel_capacity_kw'] * profile['panel_efficiency']
            
            # Add small noise
            production_kw *= np.random.uniform(0.95, 1.05)
            
            return max(0, production_kw)
        else:
            return 0.0
    
    def generate_consumption(self, house_id, timestamp):
        """
        Generate realistic household consumption
        """
        profile = self.house_profiles[house_id]
        hour = timestamp.hour
        day_of_week = timestamp.weekday()
        is_weekend = day_of_week >= 5
        
        # Base consumption by type
        base_consumption = {
            'low': 1.0,
            'medium': 2.0,
            'high': 3.5
        }
        
        base = base_consumption[profile['consumption_type']]
        
        # Time of day patterns
        if 0 <= hour < 6:
            # Night: low consumption
            multiplier = 0.3
        elif 6 <= hour < 9:
            # Morning peak
            multiplier = 1.5
        elif 9 <= hour < 17:
            # Daytime: lower if people at work
            multiplier = 0.8 if not is_weekend else 1.2
        elif 17 <= hour < 22:
            # Evening peak
            multiplier = 2.0
        else:
            # Late evening
            multiplier = 0.6
        
        # Weekend adjustment
        if is_weekend:
            multiplier *= 1.2
        
        # Occupant factor
        occupant_factor = 0.5 + (profile['occupants'] / 10)
        
        # EV charging (evening, 2-3 times per week)
        ev_charging = 0.0
        if profile['has_ev'] and 18 <= hour <= 23 and np.random.random() < 0.3:
            ev_charging = np.random.uniform(5.0, 7.0)
        
        consumption = base * multiplier * occupant_factor + ev_charging
        
        # Add randomness
        consumption *= np.random.uniform(0.9, 1.1)
        
        return max(0.1, consumption)
    
    def generate_weather_data(self, timestamp):
        """Generate weather conditions"""
        hour = timestamp.hour
        day_of_year = timestamp.timetuple().tm_yday
        
        # Temperature (Tunisia climate)
        base_temp = 20 + 10 * np.sin((day_of_year - 80) * 2 * np.pi / 365)  # Seasonal
        daily_variation = 8 * np.sin((hour - 6) * np.pi / 12)  # Daily cycle
        temperature = base_temp + daily_variation + np.random.normal(0, 2)
        
        # Cloud cover (0-100%)
        cloud_cover = max(0, min(100, np.random.beta(2, 5) * 100))
        
        # Humidity (30-80%)
        humidity = np.random.uniform(30, 80)
        
        # Wind speed (0-20 km/h)
        wind_speed = np.random.exponential(5)
        
        return {
            'temperature': temperature,
            'cloud_cover': cloud_cover,
            'humidity': humidity,
            'wind_speed': min(wind_speed, 20)
        }
    
    def generate_dataset(self):
        """
        Generate complete dataset for all houses and timeperiod
        """
        print(f"🔄 Generating synthetic data for {self.num_houses} houses over {self.days} days...")
        
        start_date = datetime(2024, 1, 1)
        timestamps = [start_date + timedelta(hours=h) for h in range(self.hours)]
        
        data = []
        
        for timestamp in timestamps:
            weather = self.generate_weather_data(timestamp)
            
            for house_id in range(self.num_houses):
                production = self.generate_solar_production(house_id, timestamp)
                consumption = self.generate_consumption(house_id, timestamp)
                
                data.append({
                    'timestamp': timestamp,
                    'house_id': house_id,
                    'production_kwh': production,
                    'consumption_kwh': consumption,
                    'temperature_c': weather['temperature'],
                    'cloud_cover_pct': weather['cloud_cover'],
                    'humidity_pct': weather['humidity'],
                    'wind_speed_kmh': weather['wind_speed']
                })
        
        df = pd.DataFrame(data)
        
        print(f"✅ Generated {len(df)} data points")
        print(f"   Total production: {df['production_kwh'].sum():.1f} kWh")
        print(f"   Total consumption: {df['consumption_kwh'].sum():.1f} kWh")
        
        return df
    
    def save_dataset(self, output_path='data/processed/synthetic/community_90days.csv'):
        """Generate and save dataset"""
        df = self.generate_dataset()
        
        # Create directory if needed
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Save to CSV
        df.to_csv(output_path, index=False)
        print(f"💾 Saved to {output_path}")
        
        # Save house profiles
        profiles_df = pd.DataFrame(self.house_profiles)
        profiles_path = output_path.replace('community_90days.csv', 'house_profiles.csv')
        profiles_df.to_csv(profiles_path, index=False)
        print(f"💾 Saved house profiles to {profiles_path}")
        
        return df


# Usage
if __name__ == "__main__":
    generator = SyntheticDataGenerator(num_houses=50, days=90)
    df = generator.save_dataset()
    
    # Display sample
    print("\n📊 Sample data:")
    print(df.head(10))
    
    # Statistics
    print("\n📈 Statistics:")
    print(df.groupby('house_id')[['production_kwh', 'consumption_kwh']].sum().describe())
