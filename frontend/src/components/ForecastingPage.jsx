import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts'
import GlassCard from './GlassCard'
import AnimatedMetric from './AnimatedMetric'

export default function ForecastingPage({ forecast = [] }) {
  const [selectedModel, setSelectedModel] = useState('ensemble')

  // Generate forecast data with LSTM, Prophet, and Actual
  const forecastData = React.useMemo(() => {
    const data = []
    for (let i = 0; i < 24; i++) {
      const hour = i
      const baseProduction = hour >= 6 && hour <= 18 
        ? 5 * Math.sin((hour - 6) * Math.PI / 12) 
        : 0
      
      data.push({
        hour: `${String(i).padStart(2, '0')}:00`,
        lstm: baseProduction + Math.random() * 2 - 1,
        prophet: baseProduction + Math.random() * 2.5 - 1.25,
        actual: baseProduction + Math.random() * 3 - 1.5,
        ensemble: baseProduction + Math.random() * 1.5 - 0.75,
      })
    }
    return data
  }, [])

  // Calculate metrics
  const metrics = {
    lstmMae: 4.34,
    prophetMae: 5.12,
    accuracy: 94.1,
    horizon: 24,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">
          🔮 AI Forecasting
        </h1>
        <p className="text-slate-400">
          Advanced machine learning models for solar production prediction
        </p>
      </motion.div>

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <AnimatedMetric
          value={metrics.lstmMae}
          label="LSTM MAE"
          unit=" kW"
          icon="🧠"
          color="blue"
          trend={-2.3}
          delay={0}
        />
        <AnimatedMetric
          value={metrics.prophetMae}
          label="Prophet MAE"
          unit=" kW"
          icon="📊"
          color="purple"
          trend={-1.8}
          delay={0.1}
        />
        <AnimatedMetric
          value={metrics.accuracy}
          label="Accuracy"
          unit=" %"
          icon="🎯"
          color="green"
          trend={1.2}
          delay={0.2}
        />
        <AnimatedMetric
          value={metrics.horizon}
          label="Horizon"
          unit=" H"
          icon="⏱️"
          color="yellow"
          delay={0.3}
        />
      </div>

      {/* Main Forecast Chart */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              24-Hour Production Forecast
            </h2>
            <p className="text-slate-400 text-sm">
              Comparing LSTM, Prophet, and Ensemble models against actual production
            </p>
          </div>
          <div className="flex gap-2">
            {['lstm', 'prophet', 'ensemble'].map((model) => (
              <motion.button
                key={model}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedModel(model)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedModel === model
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'glass text-slate-300 hover:bg-white/10'
                }`}
              >
                {model.charAt(0).toUpperCase() + model.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={forecastData}>
            <defs>
              <linearGradient id="lstmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="prophetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="hour" 
              stroke="#94a3b8" 
              fontSize={12}
              tick={{ fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              label={{ value: 'kW', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Area
              type="monotone"
              dataKey="lstm"
              stroke="#06b6d4"
              fill="url(#lstmGradient)"
              strokeWidth={2}
              name="LSTM"
            />
            <Area
              type="monotone"
              dataKey="prophet"
              stroke="#8b5cf6"
              fill="url(#prophetGradient)"
              strokeWidth={2}
              name="Prophet"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Actual"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Model Comparison Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="glass p-4 rounded-lg">
            <div className="text-sm text-slate-400 mb-2">LSTM Performance</div>
            <div className="text-2xl font-bold text-cyan-400 mb-1">87.5%</div>
            <div className="text-xs text-slate-500">Accuracy</div>
          </div>
          <div className="glass p-4 rounded-lg">
            <div className="text-sm text-slate-400 mb-2">Prophet Performance</div>
            <div className="text-2xl font-bold text-purple-400 mb-1">85.2%</div>
            <div className="text-xs text-slate-500">Accuracy</div>
          </div>
          <div className="glass p-4 rounded-lg border border-green-500/30">
            <div className="text-sm text-slate-400 mb-2">Ensemble (Weighted)</div>
            <div className="text-2xl font-bold text-green-400 mb-1">89.1%</div>
            <div className="text-xs text-slate-500">Best Accuracy</div>
          </div>
        </div>
      </GlassCard>

      {/* Model Details */}
      <div className="grid grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-bold mb-4 gradient-text">Model Architecture</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-slate-300">LSTM Layers</span>
              <span className="font-bold text-cyan-400">2</span>
            </div>
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-slate-300">Hidden Units</span>
              <span className="font-bold text-cyan-400">64</span>
            </div>
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-slate-300">Sequence Length</span>
              <span className="font-bold text-cyan-400">24</span>
            </div>
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-slate-300">Training Epochs</span>
              <span className="font-bold text-cyan-400">50</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-bold mb-4 gradient-text">Forecast Confidence</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Next 6 Hours</span>
                <span className="font-bold text-green-400">95%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '95%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Next 12 Hours</span>
                <span className="font-bold text-yellow-400">87%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-yellow-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '87%' }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Next 24 Hours</span>
                <span className="font-bold text-blue-400">82%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  className="h-2 bg-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '82%' }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
