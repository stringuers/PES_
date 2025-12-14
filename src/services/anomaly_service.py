"""
Anomaly Detection Service
Detects anomalies in energy production/consumption patterns
"""
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime

try:
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

class AnomalyDetectionService:
    """Service for detecting anomalies in energy data"""
    
    def __init__(self):
        self.isolation_forest = None
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self._trained = False
    
    def train(self, historical_data: List[Dict]):
        """Train anomaly detection model on historical data"""
        if not SKLEARN_AVAILABLE:
            return
        
        try:
            # Extract features
            features = []
            for data_point in historical_data:
                features.append([
                    data_point.get('production', 0),
                    data_point.get('consumption', 0),
                    data_point.get('battery_level', 0),
                    data_point.get('net_energy', 0),
                    data_point.get('hour', 12) / 24.0,
                ])
            
            if len(features) < 10:
                return  # Need minimum data
            
            X = np.array(features)
            X_scaled = self.scaler.fit_transform(X)
            
            # Train Isolation Forest
            self.isolation_forest = IsolationForest(
                contamination=0.1,
                n_estimators=100,
                random_state=42
            )
            self.isolation_forest.fit(X_scaled)
            self._trained = True
            print("✅ Anomaly detection model trained")
        except Exception as e:
            print(f"⚠️ Anomaly detection training failed: {e}")
    
    def detect_anomalies(self, current_data: List[Dict]) -> List[Dict]:
        """
        Detect anomalies in current data
        Returns list of anomaly alerts
        """
        alerts = []
        
        if not self._trained or not SKLEARN_AVAILABLE:
            # Fallback: rule-based detection
            return self._rule_based_detection(current_data)
        
        try:
            # Extract features
            features = []
            for data_point in current_data:
                features.append([
                    data_point.get('production', 0),
                    data_point.get('consumption', 0),
                    data_point.get('battery_level', 0),
                    data_point.get('net_energy', 0),
                    data_point.get('hour', 12) / 24.0,
                ])
            
            X = np.array(features)
            X_scaled = self.scaler.transform(X)
            
            # Predict anomalies
            predictions = self.isolation_forest.predict(X_scaled)
            anomaly_scores = self.isolation_forest.score_samples(X_scaled)
            
            # Generate alerts
            for i, (data_point, is_anomaly, score) in enumerate(zip(current_data, predictions, anomaly_scores)):
                if is_anomaly == -1:  # Anomaly detected
                    alerts.append({
                        "agent_id": data_point.get('agent_id', i),
                        "timestamp": datetime.now().isoformat(),
                        "type": self._classify_anomaly(data_point),
                        "severity": "high" if score < -0.5 else "medium",
                        "description": self._get_anomaly_description(data_point, score),
                        "score": float(score)
                    })
        except Exception as e:
            print(f"Anomaly detection failed: {e}, using rule-based")
            return self._rule_based_detection(current_data)
        
        return alerts
    
    def _rule_based_detection(self, data: List[Dict]) -> List[Dict]:
        """Rule-based anomaly detection fallback"""
        alerts = []
        
        for i, point in enumerate(data):
            production = point.get('production', 0)
            consumption = point.get('consumption', 0)
            battery = point.get('battery_level', 0)
            hour = point.get('hour', 12)
            
            # Rule 1: Unexpectedly low production during daylight
            if 6 <= hour <= 18 and production < 0.5:
                alerts.append({
                    "agent_id": point.get('agent_id', i),
                    "timestamp": datetime.now().isoformat(),
                    "type": "low_production",
                    "severity": "medium",
                    "description": f"Very low production ({production:.2f} kWh) during daylight hours",
                    "score": -0.3
                })
            
            # Rule 2: Extremely high consumption
            if consumption > 8:
                alerts.append({
                    "agent_id": point.get('agent_id', i),
                    "timestamp": datetime.now().isoformat(),
                    "type": "high_consumption",
                    "severity": "high",
                    "description": f"Unusually high consumption ({consumption:.2f} kWh)",
                    "score": -0.5
                })
            
            # Rule 3: Battery critically low
            if battery < 0.1:
                alerts.append({
                    "agent_id": point.get('agent_id', i),
                    "timestamp": datetime.now().isoformat(),
                    "type": "low_battery",
                    "severity": "high",
                    "description": f"Battery critically low ({battery:.2f} kWh)",
                    "score": -0.4
                })
            
            # Rule 4: Production but no consumption (possible panel issue)
            if production > 2 and consumption < 0.1:
                alerts.append({
                    "agent_id": point.get('agent_id', i),
                    "timestamp": datetime.now().isoformat(),
                    "type": "unusual_pattern",
                    "severity": "low",
                    "description": "Production but minimal consumption detected",
                    "score": -0.2
                })
        
        return alerts
    
    def _classify_anomaly(self, data_point: Dict) -> str:
        """Classify the type of anomaly"""
        production = data_point.get('production', 0)
        consumption = data_point.get('consumption', 0)
        battery = data_point.get('battery_level', 0)
        
        if production < 0.5:
            return "low_production"
        elif consumption > 6:
            return "high_consumption"
        elif battery < 0.2:
            return "low_battery"
        else:
            return "unusual_pattern"
    
    def _get_anomaly_description(self, data_point: Dict, score: float) -> str:
        """Generate human-readable description"""
        production = data_point.get('production', 0)
        consumption = data_point.get('consumption', 0)
        battery = data_point.get('battery_level', 0)
        
        if score < -0.5:
            return f"Severe anomaly: Production={production:.2f} kWh, Consumption={consumption:.2f} kWh, Battery={battery:.2f} kWh"
        else:
            return f"Anomaly detected: Production={production:.2f} kWh, Consumption={consumption:.2f} kWh"

# Global service instance
_anomaly_service = None

def get_anomaly_service() -> AnomalyDetectionService:
    """Get or create anomaly detection service singleton"""
    global _anomaly_service
    if _anomaly_service is None:
        _anomaly_service = AnomalyDetectionService()
    return _anomaly_service

