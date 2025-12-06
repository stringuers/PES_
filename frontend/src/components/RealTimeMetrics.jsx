import React from 'react'

function ProgressBar({ label, value, max, unit, trend, color = 'blue' }) {
  const percentage = Math.min((value / max) * 100, 100)
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm font-bold text-white">
          {typeof value === 'number' ? value.toFixed(1) : '0.0'}{unit}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs baseline
        </div>
      )}
    </div>
  )
}

export default function RealTimeMetrics({ metrics = {} }) {
  const {
    solar_utilization_pct = 87,
    self_sufficiency_pct = 78,
    grid_dependency_pct = 13,
    cost_savings_daily = 284,
    cost_savings_monthly = 8520,
    co2_avoided_kg = 156,
    energy_shared_kwh = 248
  } = metrics || {}

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        📊 COMMUNITY PERFORMANCE
      </h2>
      
      <div className="space-y-4">
        <ProgressBar
          label="🌞 Solar Usage Rate"
          value={solar_utilization_pct}
          max={100}
          unit="%"
          trend={12}
          color="green"
        />
        
        <ProgressBar
          label="🔋 Community Battery Level"
          value={self_sufficiency_pct}
          max={100}
          unit="%"
          color="blue"
        />
        
        <ProgressBar
          label="🌐 Grid Dependency"
          value={grid_dependency_pct}
          max={100}
          unit="%"
          trend={-35}
          color="red"
        />
        
        <div className="pt-2 border-t border-slate-700">
          <div className="mb-3">
            <div className="text-sm text-slate-400 mb-1">💰 Cost Savings Today</div>
            <div className="text-2xl font-bold text-green-400">${typeof cost_savings_daily === 'number' ? cost_savings_daily.toFixed(0) : '0'}</div>
            <div className="text-xs text-slate-500">${typeof cost_savings_monthly === 'number' ? cost_savings_monthly.toFixed(0) : '0'}/month projected</div>
          </div>
          
          <div className="mb-3">
            <div className="text-sm text-slate-400 mb-1">🌱 CO₂ Avoided Today</div>
            <div className="text-2xl font-bold text-green-400">{typeof co2_avoided_kg === 'number' ? co2_avoided_kg.toFixed(0) : '0'} kg CO₂</div>
            <div className="text-xs text-slate-500">{(typeof co2_avoided_kg === 'number' ? co2_avoided_kg * 30 / 1000 : 0).toFixed(1)} tons/month</div>
          </div>
          
          <div>
            <div className="text-sm text-slate-400 mb-1">⚡ Energy Shared (P2P)</div>
            <div className="text-2xl font-bold text-blue-400">{typeof energy_shared_kwh === 'number' ? energy_shared_kwh.toFixed(0) : '0'} kWh</div>
            <div className="text-xs text-slate-500">142 successful transfers</div>
          </div>
        </div>
      </div>
    </div>
  )
}
