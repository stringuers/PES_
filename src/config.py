"""
Configuration Management Module
Loads settings from config.yaml and environment variables
"""

import os
import yaml
from pathlib import Path
from dotenv import load_dotenv
from typing import Any, Dict

# Load environment variables
load_dotenv()

class Config:
    """
    Central configuration manager for Solar Swarm Intelligence
    """
    
    def __init__(self, config_path: str = "config.yaml"):
        self.config_path = Path(config_path)
        self.config = self._load_config()
        self._override_from_env()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file"""
        if not self.config_path.exists():
            raise FileNotFoundError(f"Config file not found: {self.config_path}")
        
        with open(self.config_path, 'r') as f:
            return yaml.safe_load(f)
    
    def _override_from_env(self):
        """Override config values from environment variables"""
        # API Keys
        if os.getenv('WEATHER_API_KEY'):
            self.weather_api_key = os.getenv('WEATHER_API_KEY')
        
        # System settings
        if os.getenv('NUM_AGENTS'):
            self.config['system']['num_agents'] = int(os.getenv('NUM_AGENTS'))
        
        if os.getenv('LOG_LEVEL'):
            self.config['logging']['level'] = os.getenv('LOG_LEVEL')
    
    def get(self, key_path: str, default=None):
        """
        Get configuration value using dot notation
        Example: config.get('agent.battery_capacity_kwh')
        """
        keys = key_path.split('.')
        value = self.config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
    
    # Convenience properties
    @property
    def num_agents(self) -> int:
        return self.get('system.num_agents', 50)
    
    @property
    def battery_capacity(self) -> float:
        return self.get('agent.battery_capacity_kwh', 10.0)
    
    @property
    def grid_price(self) -> float:
        return self.get('economics.grid_buy_price', 0.15)
    
    @property
    def api_host(self) -> str:
        return os.getenv('API_HOST', self.get('api.host', '0.0.0.0'))
    
    @property
    def api_port(self) -> int:
        return int(os.getenv('API_PORT', self.get('api.port', 8000)))
    
    @property
    def cors_origins(self) -> list:
        env_origins = os.getenv('CORS_ORIGINS')
        if env_origins:
            return env_origins.split(',')
        return self.get('api.cors_origins', ['http://localhost:3000'])
    
    @property
    def log_level(self) -> str:
        return os.getenv('LOG_LEVEL', self.get('logging.level', 'INFO'))
    
    @property
    def data_paths(self) -> Dict[str, str]:
        return self.get('paths', {})
    
    def __repr__(self):
        return f"Config(agents={self.num_agents}, battery={self.battery_capacity}kWh)"


# Global config instance
config = Config()

# Export for easy imports
__all__ = ['config', 'Config']
