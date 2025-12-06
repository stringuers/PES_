import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

export default function SolarForecast({ forecast = [], weather = [] }) {
  // Default mock data if no forecast provided
  const defaultForecast = [
    { hour: 'Now', production: 4.2, lower: 3.8, upper: 4.6, weather: '☀️' },
    { hour: '+2h', production: 3.8, lower: 3.4, upper: 4.2, weather: '⛅' },
    { hour: '+4h', production: 2.1, lower: 1.5, upper: 2.7, weather: '☁️' },
    { hour: '+6h', production: 3.5, lower: 3.1, upper: 3.9, weather: '☀️' },
  ]

  // Handle forecast data structure from API
  let data = defaultForecast
  if (forecast && Array.isArray(forecast)) {
    if (forecast.length > 0 && forecast[0].predicted_kwh !== undefined) {
      // API format: { timestamp, predicted_kwh, confidence_lower, confidence_upper }
      data = forecast.slice(0, 4).map((item, idx) => ({
        hour: idx === 0 ? 'Now' : `+${idx * 2}h`,
        production: item.predicted_kwh || 0,
        lower: item.confidence_lower || 0,
        upper: item.confidence_upper || 0,
        weather: '☀️'
      }))
    } else if (forecast.length > 0 && forecast[0].production !== undefined) {
      // Already in correct format
      data = forecast.slice(0, 4)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🔮 AI FORECASTING
      </h2>
      
      <div className="mb-4">
        <div className="text-sm text-slate-400 mb-2">Next 6 Hours Production:</div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="#60a5fa"
              fillOpacity={0}
              strokeWidth={0}
            />
            <Area
              type="monotone"
              dataKey="production"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorProduction)"
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="#60a5fa"
              fillOpacity={0}
              strokeWidth={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="text-sm font-semibold text-yellow-400 mb-1">⚠️ PREDICTION ALERTS:</div>
          <div className="text-xs text-slate-300 space-y-2">
            <div>
              <div className="flex items-center gap-2">
                <span>☁️</span>
                <span className="font-medium">Cloud cover at 14:30</span>
              </div>
              <div className="ml-6 text-slate-400">Impact: -40% production</div>
              <div className="ml-6 text-slate-400">Action: Pre-charge batteries</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>🌡️</span>
                <span className="font-medium">High demand at 18:00</span>
              </div>
              <div className="ml-6 text-slate-400">Prepare: Store 45 kWh surplus</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-2">Weather Forecast:</div>
          <div className="space-y-1 text-xs">
            {data.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-slate-300">{item.hour}:</span>
                <span className="text-slate-400">{item.weather || '☀️'} Clear</span>
                <span className="text-slate-500">| {28 + idx}°C</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

