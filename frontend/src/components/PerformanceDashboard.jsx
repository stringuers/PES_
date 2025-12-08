import React from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import GlassCard from './GlassCard'

export default function PerformanceDashboard({ metrics, history }) {
  const performanceData = [
    { time: '00:00', solar: 0, grid: 5, shared: 0 },
    { time: '06:00', solar: 2, grid: 3, shared: 1 },
    { time: '12:00', solar: 8, grid: 1, shared: 5 },
    { time: '18:00', solar: 4, grid: 4, shared: 2 },
    { time: '24:00', solar: 0, grid: 5, shared: 0 },
  ]

  const efficiencyData = [
    { metric: 'Solar Usage', value: metrics?.solar_utilization_pct || 0, target: 87 },
    { metric: 'Self-Sufficiency', value: metrics?.self_sufficiency_pct || 0, target: 80 },
    { metric: 'Cost Savings', value: (metrics?.cost_savings_daily || 0) / 10, target: 35 },
  ]

  return (
    <div className="space-y-6">
      <GlassCard className="col-span-full">
        <h3 className="text-2xl font-bold mb-6 gradient-text">📊 Performance Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Energy Flow Over Time */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Energy Flow (24h)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gridGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="solar" stroke="#fbbf24" fill="url(#solarGrad)" />
                <Area type="monotone" dataKey="grid" stroke="#ef4444" fill="url(#gridGrad)" />
                <Area type="monotone" dataKey="shared" stroke="#3b82f6" fill="url(#solarGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Efficiency vs Target */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Efficiency vs Targets</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="metric" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="#64748b" radius={[8, 8, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
