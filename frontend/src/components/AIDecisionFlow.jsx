import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

export default function AIDecisionFlow({ agentDecisions = [], agents = [] }) {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [decisionHistory, setDecisionHistory] = useState([])
  
  // Process decision data
  const decisionStats = React.useMemo(() => {
    const stats = {
      charge_battery: 0,
      share_energy: 0,
      sell_to_grid: 0,
      request_energy: 0
    }
    
    agentDecisions.forEach(decision => {
      if (decision.action) {
        stats[decision.action] = (stats[decision.action] || 0) + 1
      }
    })
    
    return Object.entries(stats).map(([action, count]) => ({
      action: action.replace('_', ' ').toUpperCase(),
      count,
      percentage: (count / agentDecisions.length * 100) || 0
    }))
  }, [agentDecisions])
  
  // Agent decision timeline
  const timelineData = React.useMemo(() => {
    const last10 = agentDecisions.slice(-10)
    return last10.map((d, idx) => ({
      time: idx,
      agent: d.agent_id || 0,
      action: d.action || 'unknown',
      amount: d.amount || 0
    }))
  }, [agentDecisions])
  
  const colors = {
    'charge battery': '#10b981',
    'share energy': '#3b82f6',
    'sell to grid': '#f59e0b',
    'request energy': '#ef4444'
  }
  
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🤖 AI DECISION FLOW ANALYSIS
      </h2>
      
      <div className="space-y-4">
        {/* Decision Distribution */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Decision Distribution (Last 50 decisions):</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={decisionStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="action" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {decisionStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[entry.action.toLowerCase()] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Decision Timeline */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Recent Decision Timeline:</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {timelineData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs bg-slate-700/50 rounded p-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-slate-300">Agent #{item.agent}</span>
                <span className="text-slate-400">→</span>
                <span className={`px-2 py-0.5 rounded text-white ${
                  item.action === 'share_energy' ? 'bg-blue-500' :
                  item.action === 'charge_battery' ? 'bg-green-500' :
                  item.action === 'sell_to_grid' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {item.action.replace('_', ' ')}
                </span>
                <span className="text-slate-500 ml-auto">{item.amount.toFixed(1)} kWh</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI Reasoning Process */}
        <div className="pt-2 border-t border-slate-700">
          <div className="text-sm font-semibold text-slate-300 mb-2">AI Reasoning Process:</div>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">1</div>
              <div>
                <div className="text-slate-300 font-medium">State Observation</div>
                <div className="text-slate-500">Agent analyzes: production, consumption, battery level, neighbor status</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</div>
              <div>
                <div className="text-slate-300 font-medium">Decision Evaluation</div>
                <div className="text-slate-500">RL model calculates Q-values for each possible action</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">3</div>
              <div>
                <div className="text-slate-300 font-medium">Action Selection</div>
                <div className="text-slate-500">Agent selects action with highest expected reward</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">4</div>
              <div>
                <div className="text-slate-300 font-medium">Reward Learning</div>
                <div className="text-slate-500">System updates Q-values based on actual outcomes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

