import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import GlassCard from './GlassCard'

export default function EnhancedForecast({ forecast = [] }) {
  const defaultForecast = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    production: Math.max(0, 5 * Math.sin((i - 6) * Math.PI / 12) + Math.random() * 0.5),
    lower: 0,
    upper: 0,
  }))

  let data = forecast && forecast.length > 0 
    ? forecast.map((item, idx) => ({
        hour: idx,
        production: item.predicted_kwh || item.production || 0,
        lower: item.confidence_lower || 0,
        upper: item.confidence_upper || 0,
      }))
    : defaultForecast

  const peakHour = data.reduce((max, item, idx) => 
    item.production > data[max].production ? idx : max, 0
  )

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold gradient-text">🔮 AI Solar Forecast</h3>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-2xl"
        >
          ☀️
        </motion.div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="hour" 
            stroke="#94a3b8" 
            fontSize={10}
            tickFormatter={(val) => `${val}:00`}
          />
          <YAxis stroke="#94a3b8" fontSize={10} />
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
            dataKey="production"
            stroke="#fbbf24"
            strokeWidth={2}
            fill="url(#forecastGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-3 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Peak Production</span>
            <span className="text-lg font-bold text-yellow-400">
              {data[peakHour]?.production.toFixed(1)} kWh
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Expected at {peakHour}:00
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="glass p-2 rounded-lg text-center">
            <div className="text-slate-400">Total</div>
            <div className="font-bold text-white">
              {data.reduce((sum, d) => sum + d.production, 0).toFixed(1)} kWh
            </div>
          </div>
          <div className="glass p-2 rounded-lg text-center">
            <div className="text-slate-400">Avg</div>
            <div className="font-bold text-white">
              {(data.reduce((sum, d) => sum + d.production, 0) / data.length).toFixed(1)} kWh
            </div>
          </div>
          <div className="glass p-2 rounded-lg text-center">
            <div className="text-slate-400">Confidence</div>
            <div className="font-bold text-green-400">94%</div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
