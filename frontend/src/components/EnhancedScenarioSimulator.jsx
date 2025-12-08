import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { runScenario } from '../api'
import GlassCard from './GlassCard'

export default function EnhancedScenarioSimulator({ onScenarioRun }) {
  const [selectedScenarios, setSelectedScenarios] = useState(['cloudy_day'])
  const [customScenario, setCustomScenario] = useState({
    modifier: 'sunny',
    cloudCover: 52,
    time: '14:30'
  })
  const [loading, setLoading] = useState(false)

  const scenarios = [
    { id: 'cloudy_day', label: 'Add Cloud Cover', icon: '☁️', checked: selectedScenarios.includes('cloudy_day') },
    { id: 'grid_outage', label: 'Grid Outage', icon: '⚡', checked: selectedScenarios.includes('grid_outage') },
    { id: 'peak_demand', label: 'Spike Demand', icon: '🔥', checked: selectedScenarios.includes('peak_demand') },
    { id: 'panel_failure', label: 'Panel Failure', icon: '🔧', checked: selectedScenarios.includes('panel_failure') },
    { id: 'night_mode', label: 'Night Mode', icon: '🌙', checked: selectedScenarios.includes('night_mode') },
    { id: 'heatwave', label: 'Heatwave', icon: '🌡️', checked: selectedScenarios.includes('heatwave') },
  ]

  const modifiers = [
    { id: 'sunny', label: 'Sunny', icon: '☀️' },
    { id: 'cloudy', label: 'Cloudy', icon: '☁️' },
    { id: 'stormy', label: 'Stormy', icon: '⛈️' },
    { id: 'partly_cloudy', label: 'Partly Cloudy', icon: '⛅' },
  ]

  const toggleScenario = (scenarioId) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    )
  }

  const handleRunSimulation = async () => {
    setLoading(true)
    try {
      // Run first selected scenario or custom
      if (selectedScenarios.length > 0) {
        const result = await runScenario(selectedScenarios[0], {
          cloud_cover: customScenario.cloudCover,
          modifier: customScenario.modifier,
          time: customScenario.time
        })
        if (onScenarioRun) onScenarioRun(result)
      } else {
        // Custom scenario
        const parameters = {
          production_factor: customScenario.modifier === 'cloudy' ? 0.3 : 
                           customScenario.modifier === 'stormy' ? 0.1 : 1.0,
          consumption_factor: 1.0,
          cloud_cover: customScenario.cloudCover / 100
        }
        const result = await runScenario('custom', parameters)
        if (onScenarioRun) onScenarioRun(result)
      }
    } catch (error) {
      console.error('Scenario failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="h-full">
      <div className="mb-6">
        <h3 className="text-xl font-display font-bold gradient-text mb-2">
          🎮 SCENARIO SIMULATOR
        </h3>
        <p className="text-sm text-neutral-ash">
          Test system response to various conditions
        </p>
      </div>

      <div className="space-y-6">
        {/* Predefined Scenarios */}
        <div>
          <div className="text-sm font-medium text-neutral-silver mb-3 uppercase tracking-wider">
            Predefined Scenarios
          </div>
          <div className="grid grid-cols-3 gap-2">
            {scenarios.map((scenario) => (
              <motion.button
                key={scenario.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleScenario(scenario.id)}
                className={`p-3 rounded-xl text-xs font-medium transition-all ${
                  selectedScenarios.includes(scenario.id)
                    ? 'glass border-2 border-energy-solar/50 bg-energy-solar/10'
                    : 'glass border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{scenario.icon}</span>
                  <span className="text-neutral-silver text-[10px] text-center leading-tight">
                    {scenario.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Scenario Builder */}
        <div className="pt-4 border-t border-white/10">
          <div className="text-sm font-medium text-neutral-silver mb-4 uppercase tracking-wider">
            Custom Scenario Builder
          </div>
          
          <div className="space-y-4">
            {/* Modifier */}
            <div>
              <label className="block text-xs font-medium text-neutral-ash mb-2 uppercase tracking-wider">
                Modifier
              </label>
              <div className="grid grid-cols-2 gap-2">
                {modifiers.map((mod) => (
                  <motion.button
                    key={mod.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCustomScenario({ ...customScenario, modifier: mod.id })}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      customScenario.modifier === mod.id
                        ? 'glass border-2 border-energy-solar/50 bg-energy-solar/10'
                        : 'glass border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{mod.icon}</span>
                      <span className="text-neutral-silver">{mod.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Cloud Cover Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-neutral-ash uppercase tracking-wider">
                  Cloud Cover
                </label>
                <span className="text-sm font-bold text-energy-solar">
                  Density: {customScenario.cloudCover}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={customScenario.cloudCover}
                onChange={(e) => setCustomScenario({ ...customScenario, cloudCover: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-energy-solar"
                style={{
                  background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${customScenario.cloudCover}%, #475569 ${customScenario.cloudCover}%, #475569 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-neutral-ash mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Time Input */}
            <div>
              <label className="block text-xs font-medium text-neutral-ash mb-2 uppercase tracking-wider">
                Time
              </label>
              <input
                type="time"
                value={customScenario.time}
                onChange={(e) => setCustomScenario({ ...customScenario, time: e.target.value })}
                className="w-full input-premium"
              />
            </div>
          </div>
        </div>

        {/* Run Simulation Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRunSimulation}
          disabled={loading}
          className="w-full btn-primary py-4 text-base font-display font-bold"
        >
          {loading ? 'Running Simulation...' : '▶ Run Simulation'}
        </motion.button>
      </div>
    </GlassCard>
  )
}
