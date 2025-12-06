import React, { useState } from 'react'
import { runScenario } from '../api'

export default function ScenarioSimulator({ onScenarioRun }) {
  const [customScenario, setCustomScenario] = useState({
    weather: 'sunny',
    demand: 50,
    time: '14:30'
  })
  const [loading, setLoading] = useState(false)

  const scenarios = [
    { id: 'cloudy_day', label: '☁️ Add Cloud Cover', icon: '☁️' },
    { id: 'peak_demand', label: '🔥 Spike Demand', icon: '🔥' },
    { id: 'panel_failure', label: '🔧 Panel Failure', icon: '🔧' },
    { id: 'grid_outage', label: '⚡ Grid Outage', icon: '⚡' },
    { id: 'night_mode', label: '🌙 Night Mode', icon: '🌙' },
    { id: 'heatwave', label: '🌡️ Heatwave', icon: '🌡️' },
  ]

  const handleScenario = async (scenarioId) => {
    setLoading(true)
    try {
      const result = await runScenario(scenarioId)
      if (onScenarioRun) onScenarioRun(result)
    } catch (error) {
      console.error('Scenario failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomScenario = async () => {
    setLoading(true)
    try {
      const parameters = {
        production_factor: customScenario.weather === 'cloudy' ? 0.3 : customScenario.weather === 'stormy' ? 0.1 : 1.0,
        consumption_factor: customScenario.demand / 50
      }
      const result = await runScenario('custom', parameters)
      if (onScenarioRun) onScenarioRun(result)
    } catch (error) {
      console.error('Custom scenario failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🎮 SCENARIO SIMULATOR
      </h2>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-slate-400 mb-2">Test swarm response to various conditions:</div>
          <div className="grid grid-cols-3 gap-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleScenario(scenario.id)}
                disabled={loading}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <div className="text-sm font-semibold text-slate-300 mb-3">Custom Scenario Builder:</div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Weather:</label>
              <select
                value={customScenario.weather}
                onChange={(e) => setCustomScenario({ ...customScenario, weather: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="sunny">☀️ Sunny</option>
                <option value="cloudy">☁️ Cloudy</option>
                <option value="stormy">⛈️ Stormy</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Demand: <span className="text-white">{customScenario.demand}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={customScenario.demand}
                onChange={(e) => setCustomScenario({ ...customScenario, demand: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">Time:</label>
              <input
                type="time"
                value={customScenario.time}
                onChange={(e) => setCustomScenario({ ...customScenario, time: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            
            <button
              onClick={handleCustomScenario}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Running...' : '▶️ Run Simulation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

