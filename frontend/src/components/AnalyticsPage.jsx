import React from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import GlassCard from './GlassCard'
import AnimatedMetric from './AnimatedMetric'

export default function AnalyticsPage({ metrics = null }) {
  const safeMetrics = metrics || {}

  // Weekly cost savings data
  const weeklySavings = [
    { day: 'Mon', savings: 68 },
    { day: 'Tue', savings: 72 },
    { day: 'Wed', savings: 65 },
    { day: 'Thu', savings: 75 },
    { day: 'Fri', savings: 70 },
    { day: 'Sat', savings: 72 },
    { day: 'Sun', savings: 68 },
  ]

  // Energy distribution data
  const energyDistribution = [
    { name: 'Solar Self-Use', value: 45, color: '#fbbf24' },
    { name: 'P2P Shared', value: 25, color: '#10b981' },
    { name: 'Grid Export', value: 15, color: '#3b82f6' },
    { name: 'Battery Stored', value: 15, color: '#8b5cf6' },
  ]

  // Key metrics
  const keyMetrics = [
    {
      label: 'Monthly Savings',
      value: safeMetrics.cost_savings_monthly || 2847,
      unit: ' $',
      icon: '💰',
      color: 'green',
      trend: 12.5,
    },
    {
      label: 'CO₂ Avoided',
      value: (safeMetrics.co2_avoided_kg || 1200) / 1000,
      unit: ' tons',
      icon: '🌱',
      color: 'green',
      trend: 8.3,
    },
    {
      label: 'Grid Dependency',
      value: safeMetrics.grid_dependency_pct || 23,
      unit: ' %',
      icon: '⚡',
      color: 'blue',
      trend: -15.2,
    },
    {
      label: 'Peak Shaving',
      value: 34,
      unit: ' %',
      icon: '🔋',
      color: 'yellow',
      trend: 5.7,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          📊 Analytics & Insights
        </h1>
        <p className="text-neutral-ash">
          Community impact analysis and performance metrics
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {keyMetrics.map((metric, idx) => (
          <AnimatedMetric
            key={idx}
            value={metric.value}
            label={metric.label}
            unit={metric.unit}
            icon={metric.icon}
            color={metric.color}
            trend={metric.trend}
            delay={idx * 0.1}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Weekly Cost Savings */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">Weekly Cost Savings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklySavings}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                stroke="#94a3b8" 
                fontSize={12}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                label={{ value: '$', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value) => [`$${value}`, 'Savings']}
              />
              <Bar 
                dataKey="savings" 
                fill="url(#savingsGradient)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Energy Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4 gradient-text">Energy Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={energyDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {energyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                }}
                formatter={(value) => [`${value}%`, 'Share']}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span style={{ color: '#e2e8f0' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-3 gap-6">
        {/* Performance Trends */}
        <GlassCard>
          <h3 className="text-lg font-bold mb-4 gradient-text">Performance Trends</h3>
          <div className="space-y-4">
            {[
              { label: 'Solar Utilization', value: safeMetrics.solar_utilization_pct || 87, color: 'green' },
              { label: 'Self-Sufficiency', value: safeMetrics.self_sufficiency_pct || 78, color: 'blue' },
              { label: 'Energy Efficiency', value: 92, color: 'purple' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">{item.label}</span>
                  <span className={`font-bold text-${item.color}-400`}>{item.value}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 bg-${item.color}-500 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Environmental Impact */}
        <GlassCard>
          <h3 className="text-lg font-bold mb-4 gradient-text">Environmental Impact</h3>
          <div className="space-y-4">
            <div className="glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">CO₂ Reduced</span>
                <span className="text-2xl font-bold text-green-400">
                  {(safeMetrics.co2_avoided_kg || 1212).toFixed(0)} kg
                </span>
              </div>
              <div className="text-xs text-slate-400">This month</div>
            </div>
            <div className="glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Trees Equivalent</span>
                <span className="text-2xl font-bold text-green-400">
                  {Math.round((safeMetrics.trees_equivalent || 7.4))}
                </span>
              </div>
              <div className="text-xs text-slate-400">Trees planted</div>
            </div>
            <div className="glass p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Grid Reduction</span>
                <span className="text-2xl font-bold text-blue-400">
                  {100 - (safeMetrics.grid_dependency_pct || 23)}%
                </span>
              </div>
              <div className="text-xs text-slate-400">Less grid dependency</div>
            </div>
          </div>
        </GlassCard>

        {/* Cost Analysis */}
        <GlassCard>
          <h3 className="text-lg font-bold mb-4 gradient-text">Cost Analysis</h3>
          <div className="space-y-4">
            <div className="glass p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Daily Savings</div>
              <div className="text-2xl font-bold text-green-400">
                ${(safeMetrics.cost_savings_daily || 95).toFixed(0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Average per day</div>
            </div>
            <div className="glass p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Monthly Savings</div>
              <div className="text-2xl font-bold text-green-400">
                ${(safeMetrics.cost_savings_monthly || 2847).toFixed(0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Projected</div>
            </div>
            <div className="glass p-4 rounded-lg border border-green-500/30">
              <div className="text-sm text-slate-400 mb-1">Annual Savings</div>
              <div className="text-2xl font-bold text-green-400">
                ${((safeMetrics.cost_savings_monthly || 2847) * 12).toFixed(0)}
              </div>
              <div className="text-xs text-green-400 mt-1">Estimated</div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
