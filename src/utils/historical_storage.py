"""
Historical Data Storage
Stores simulation results in SQLite database
"""
import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

class HistoricalStorage:
    """Store and retrieve simulation history"""
    
    def __init__(self, db_path: str = "data/simulation_history.db"):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
    
    def _init_db(self):
        """Initialize database schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Simulations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS simulations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                num_agents INTEGER NOT NULL,
                hours INTEGER NOT NULL,
                scenario_type TEXT,
                parameters TEXT,
                total_solar_used REAL,
                total_grid_import REAL,
                energy_shared REAL,
                solar_utilization_pct REAL,
                cost_savings REAL,
                co2_saved REAL
            )
        """)
        
        # Hourly metrics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS hourly_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                simulation_id INTEGER NOT NULL,
                hour INTEGER NOT NULL,
                total_production REAL,
                total_consumption REAL,
                total_solar_used REAL,
                total_grid_import REAL,
                energy_shared REAL,
                avg_battery_pct REAL,
                active_agents INTEGER,
                FOREIGN KEY (simulation_id) REFERENCES simulations(id)
            )
        """)
        
        # Agent states table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_states (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                simulation_id INTEGER NOT NULL,
                hour INTEGER NOT NULL,
                agent_id INTEGER NOT NULL,
                production REAL,
                consumption REAL,
                battery_level REAL,
                battery_capacity REAL,
                status TEXT,
                FOREIGN KEY (simulation_id) REFERENCES simulations(id)
            )
        """)
        
        # Energy flows table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS energy_flows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                simulation_id INTEGER NOT NULL,
                hour INTEGER NOT NULL,
                from_agent INTEGER NOT NULL,
                to_agent INTEGER NOT NULL,
                amount REAL,
                FOREIGN KEY (simulation_id) REFERENCES simulations(id)
            )
        """)
        
        conn.commit()
        conn.close()
    
    def save_simulation(
        self,
        num_agents: int,
        hours: int,
        scenario_type: Optional[str] = None,
        parameters: Optional[Dict] = None,
        step_results: List[Dict] = None
    ) -> int:
        """Save a complete simulation"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calculate summary metrics
        if step_results:
            total_solar = sum(r.get('total_solar_used', 0) for r in step_results)
            total_grid = sum(r.get('total_grid_import', 0) for r in step_results)
            total_shared = sum(r.get('total_shared', 0) for r in step_results)
            total_prod = sum(r.get('total_production', 0) for r in step_results)
            solar_util = (total_solar / total_prod * 100) if total_prod > 0 else 0
            cost_savings = sum(r.get('cost_savings', 0) for r in step_results)
            co2_saved = sum(r.get('co2_saved', 0) for r in step_results)
        else:
            total_solar = total_grid = total_shared = solar_util = cost_savings = co2_saved = 0
        
        # Insert simulation record
        cursor.execute("""
            INSERT INTO simulations (
                timestamp, num_agents, hours, scenario_type, parameters,
                total_solar_used, total_grid_import, energy_shared,
                solar_utilization_pct, cost_savings, co2_saved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.now().isoformat(),
            num_agents,
            hours,
            scenario_type,
            json.dumps(parameters) if parameters else None,
            total_solar,
            total_grid,
            total_shared,
            solar_util,
            cost_savings,
            co2_saved
        ))
        
        simulation_id = cursor.lastrowid
        
        # Save hourly metrics and agent states
        if step_results:
            for hour, result in enumerate(step_results):
                # Hourly metrics
                cursor.execute("""
                    INSERT INTO hourly_metrics (
                        simulation_id, hour, total_production, total_consumption,
                        total_solar_used, total_grid_import, energy_shared,
                        avg_battery_pct, active_agents
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    simulation_id,
                    hour,
                    result.get('total_production', 0),
                    result.get('total_consumption', 0),
                    result.get('total_solar_used', 0),
                    result.get('total_grid_import', 0),
                    result.get('total_shared', 0),
                    result.get('avg_battery', 0),
                    result.get('active_agents', 0)
                ))
                
                # Energy flows
                for flow in result.get('energy_flows', []):
                    cursor.execute("""
                        INSERT INTO energy_flows (
                            simulation_id, hour, from_agent, to_agent, amount
                        ) VALUES (?, ?, ?, ?, ?)
                    """, (
                        simulation_id,
                        hour,
                        flow.get('from'),
                        flow.get('to'),
                        flow.get('amount', 0)
                    ))
        
        conn.commit()
        conn.close()
        
        return simulation_id
    
    def get_simulation_history(self, limit: int = 10) -> List[Dict]:
        """Get recent simulation history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM simulations
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))
        
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        
        results = []
        for row in rows:
            result = dict(zip(columns, row))
            if result.get('parameters'):
                result['parameters'] = json.loads(result['parameters'])
            results.append(result)
        
        conn.close()
        return results
    
    def get_simulation_details(self, simulation_id: int) -> Dict:
        """Get detailed simulation data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get simulation
        cursor.execute("SELECT * FROM simulations WHERE id = ?", (simulation_id,))
        sim_row = cursor.fetchone()
        if not sim_row:
            conn.close()
            return None
        
        columns = [desc[0] for desc in cursor.description]
        simulation = dict(zip(columns, sim_row))
        if simulation.get('parameters'):
            simulation['parameters'] = json.loads(simulation['parameters'])
        
        # Get hourly metrics
        cursor.execute("""
            SELECT * FROM hourly_metrics
            WHERE simulation_id = ?
            ORDER BY hour
        """, (simulation_id,))
        
        hourly_rows = cursor.fetchall()
        hourly_columns = [desc[0] for desc in cursor.description]
        simulation['hourly_metrics'] = [
            dict(zip(hourly_columns, row)) for row in hourly_rows
        ]
        
        # Get energy flows
        cursor.execute("""
            SELECT * FROM energy_flows
            WHERE simulation_id = ?
            ORDER BY hour, from_agent
        """, (simulation_id,))
        
        flow_rows = cursor.fetchall()
        flow_columns = [desc[0] for desc in cursor.description]
        simulation['energy_flows'] = [
            dict(zip(flow_columns, row)) for row in flow_rows
        ]
        
        conn.close()
        return simulation
    
    def get_metrics_history(self, hours: int = 24) -> Dict:
        """Get aggregated metrics over time"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get recent simulations
        cursor.execute("""
            SELECT 
                timestamp,
                solar_utilization_pct,
                energy_shared_kwh,
                cost_savings_daily,
                co2_avoided_kg
            FROM simulations
            WHERE timestamp >= datetime('now', '-' || ? || ' hours')
            ORDER BY timestamp
        """, (hours,))
        
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        
        results = [dict(zip(columns, row)) for row in rows]
        
        conn.close()
        return {'metrics': results}

