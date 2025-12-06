import React, { useState } from 'react'

export default function SwarmMonitor({ agents = [] }) {
  const [negotiations, setNegotiations] = useState([
    { from: 23, to: 47, amount: 3.2, status: 'agreed' },
    { from: 12, to: 31, amount: 1.8, status: 'negotiating' },
    { from: 8, to: 'grid', amount: 5.4, status: 'selling' },
  ])

  const [recentDecisions, setRecentDecisions] = useState([
    { time: '14:23', agent: 23, action: 'Shared 2.5 kWh' },
    { time: '14:22', agent: 47, action: 'Stored 1.8 kWh' },
    { time: '14:21', action: 'Swarm: Optimized routing' },
  ])

  const activeAgents = agents.length || 50
  const messagesPerMin = 342
  const episode = 1245
  const avgReward = 18.3

  const getStatusIcon = (status) => {
    switch (status) {
      case 'agreed':
      case 'selling':
        return '✅'
      case 'negotiating':
        return '🔄'
      default:
        return '⏳'
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🤖 AI AGENT ACTIVITY
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-slate-400">Active Agents</div>
            <div className="text-xl font-bold text-white">{activeAgents}/50</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Messages/min</div>
            <div className="text-xl font-bold text-blue-400">{messagesPerMin}</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-300 mb-2">Current Negotiations:</div>
          <div className="space-y-2">
            {negotiations.map((neg, idx) => (
              <div key={idx} className="bg-slate-700/50 rounded p-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300">
                    House #{neg.from} → {typeof neg.to === 'number' ? `House #${neg.to}` : 'Grid'}: {neg.amount} kWh
                  </span>
                  <span className="text-slate-400">{getStatusIcon(neg.status)} {neg.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-300 mb-2">Recent Decisions:</div>
          <div className="space-y-1 text-xs">
            {recentDecisions.map((decision, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-400">
                <span className="text-slate-500">[{decision.time}]</span>
                <span>
                  {decision.agent ? `Agent #${decision.agent}:` : ''} {decision.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-300 mb-2">Learning Progress:</div>
          <div className="bg-slate-700 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: '83%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Episode {episode}</span>
            <span className="text-green-400">Avg Reward: +{avgReward} (improving)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

