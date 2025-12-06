import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export default function HistoricalAnalytics({ history = [] }) {
  const [timeRange, setTimeRange] = useState('7days')

  // Mock data for demonstration
  const solarUsageData = [
    { day: 'Mon', usage: 85 },
    { day: 'Tue', usage: 88 },
    { day: 'Wed', usage: 82 },
    { day: 'Thu', usage: 90 },
    { day: 'Fri', usage: 87 },
    { day: 'Sat', usage: 89 },
    { day: 'Sun', usage: 91 },
  ]

  const energyDistribution = [
    { name: 'Solar Direct', value: 65, color: '#10b981' },
    { name: 'From Storage', value: 22, color: '#3b82f6' },
    { name: 'From Grid', value: 13, color: '#ef4444' },
  ]

  const cumulativeImpact = {
    totalSaved: 1847,
    co2Avoided: 8.3,
    energyShared: 1240
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          📈 PERFORMANCE ANALYTICS
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-white text-sm"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-sm text-slate-400 mb-2">Solar Usage Trend:</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={solarUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[70, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="usage" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-green-400 mt-2">
            ↗️ Trend: +5.3% improvement this week
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-2">Energy Distribution:</div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={energyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {energyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="text-sm text-slate-400 mb-2">Cumulative Impact:</div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500">💰 Total saved</div>
                <div className="text-xl font-bold text-green-400">${cumulativeImpact.totalSaved}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">🌱 CO₂ avoided</div>
                <div className="text-xl font-bold text-green-400">{cumulativeImpact.co2Avoided} tons</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">⚡ Energy shared</div>
                <div className="text-xl font-bold text-blue-400">{cumulativeImpact.energyShared} kWh</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

