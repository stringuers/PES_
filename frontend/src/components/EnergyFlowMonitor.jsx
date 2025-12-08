import React from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'

export default function EnergyFlowMonitor({ energyFlows, agents }) {
  if (!energyFlows || energyFlows.length === 0) {
    return (
      <GlassCard>
        <h3 className="text-lg font-bold mb-4 gradient-text">Energy Flows</h3>
        <div className="text-center py-8 text-slate-400">
          <div className="text-4xl mb-2">⚡</div>
          <div>No active energy flows</div>
          <div className="text-xs mt-2">Start simulation to see energy sharing</div>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard>
      <h3 className="text-lg font-bold mb-4 gradient-text">Active Energy Flows</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {energyFlows.slice(0, 10).map((flow, idx) => {
          const fromAgent = agents.find(a => a.id === flow.from)
          const toAgent = agents.find(a => a.id === flow.to)
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 glass rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-sm font-semibold text-white">
                    House #{flow.from} → House #{flow.to}
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-400">
                  {(flow.amount || 0).toFixed(2)} kW
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  {fromAgent ? `Prod: ${(fromAgent.production || 0).toFixed(1)}kW` : 'N/A'}
                </span>
                <span>→</span>
                <span>
                  {toAgent ? `Need: ${(toAgent.consumption || 0).toFixed(1)}kW` : 'N/A'}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
      {energyFlows.length > 10 && (
        <div className="text-xs text-slate-400 mt-2 text-center">
          +{energyFlows.length - 10} more flows
        </div>
      )}
    </GlassCard>
  )
}
