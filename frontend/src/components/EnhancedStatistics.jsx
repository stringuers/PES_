import React from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function EnhancedStatistics({ metrics = {}, history = [] }) {
  // Energy distribution
  const energyDistribution = [
    { name: 'Solar Direct', value: 65, color: '#10b981' },
    { name: 'From Storage', value: 22, color: '#3b82f6' },
    { name: 'From Grid', value: 13, color: '#ef4444' }
  ]
  
  // Cost breakdown
  const costBreakdown = [
    { category: 'Grid Import', cost: 45.2, color: '#ef4444' },
    { category: 'Grid Export', revenue: -12.8, color: '#10b981' },
    { category: 'P2P Trading', revenue: -8.5, color: '#3b82f6' },
    { category: 'Savings', savings: 23.9, color: '#fbbf24' }
  ]
  
  // Environmental impact
  const environmentalData = [
    { metric: 'CO₂ Avoided', value: 156, unit: 'kg', color: '#10b981' },
    { metric: 'Trees Equivalent', value: 7.4, unit: 'trees', color: '#3b82f6' },
    { metric: 'Grid Reduction', value: 35, unit: '%', color: '#fbbf24' }
  ]
  
  // Performance trends
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    solar: 85 + Math.random() * 10,
    efficiency: 78 + Math.random() * 15,
    savings: 250 + Math.random() * 50
  }))
  
  return (
    <div className="space-y-4">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-500/30">
          <div className="text-sm text-green-400 mb-1">Solar Utilization</div>
          <div className="text-3xl font-bold text-white">{metrics.solar_utilization_pct?.toFixed(1) || 87.0}%</div>
          <div className="text-xs text-green-400 mt-1">↑ +12% vs baseline</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-500/30">
          <div className="text-sm text-blue-400 mb-1">Self-Sufficiency</div>
          <div className="text-3xl font-bold text-white">{metrics.self_sufficiency_pct?.toFixed(1) || 78.0}%</div>
          <div className="text-xs text-blue-400 mt-1">↑ +28% improvement</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-4 border border-yellow-500/30">
          <div className="text-sm text-yellow-400 mb-1">Daily Savings</div>
          <div className="text-3xl font-bold text-white">${metrics.cost_savings_daily?.toFixed(0) || 284}</div>
          <div className="text-xs text-yellow-400 mt-1">$8,520/month projected</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
          <div className="text-sm text-purple-400 mb-1">CO₂ Avoided</div>
          <div className="text-3xl font-bold text-white">{metrics.co2_avoided_kg?.toFixed(0) || 156} kg</div>
          <div className="text-xs text-purple-400 mt-1">4.7 tons/month</div>
        </div>
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Energy Distribution */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Energy Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={energyDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
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
        
        {/* Performance Trends */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">7-Day Performance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="solar" stroke="#10b981" strokeWidth={2} name="Solar %" />
              <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} name="Efficiency %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Cost Breakdown */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={costBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="category" stroke="#94a3b8" fontSize={9} angle={-45} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={9} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Environmental Impact */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Environmental Impact</h3>
          <div className="space-y-3">
            {environmentalData.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{item.metric}</span>
                  <span className="text-white font-semibold">{item.value} {item.unit}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(item.value / 200) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* System Health */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">System Health</h3>
          <ResponsiveContainer width="100%" height={150}>
            <RadarChart data={[
              { metric: 'Battery', value: 85 },
              { metric: 'Grid', value: 78 },
              { metric: 'Sharing', value: 92 },
              { metric: 'AI', value: 89 },
              { metric: 'Network', value: 95 }
            ]}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={9} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
              <Radar
                name="Health"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

