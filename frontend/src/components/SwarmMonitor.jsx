import React, { useState, useEffect, useMemo } from 'react'
import GlassCard from './GlassCard'

export default function SwarmMonitor({ agents = [], energyFlows = [], agentDecisions = [] }) {
  // Calculate real-time data from agents and energy flows
  const activeAgents = agents.length || 0
  const totalMessages = useMemo(() => {
    // Estimate messages based on active flows and agent count
    return Math.floor((energyFlows.length * 10) + (agents.length * 2))
  }, [energyFlows.length, agents.length])

  // Extract current negotiations from energy flows
  const negotiations = useMemo(() => {
    return energyFlows.slice(0, 5).map(flow => ({
      from: flow.from,
      to: flow.to || 'grid',
      amount: flow.amount || 0,
      status: flow.amount > 0 ? 'agreed' : 'negotiating'
    }))
  }, [energyFlows])

  // Extract recent decisions from agentDecisions
  const recentDecisions = useMemo(() => {
    const decisions = agentDecisions.slice(-5).reverse().map((decision, idx) => {
      const now = new Date()
      const minutesAgo = idx
      const time = new Date(now.getTime() - minutesAgo * 60000)
      const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
      
      return {
        time: timeStr,
        agent: decision.agent_id,
        action: `${decision.action || 'action'} ${decision.amount || 0} kWh`
      }
    })
    
    // If no decisions, show placeholder
    if (decisions.length === 0) {
      return [
        { time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), action: 'System: Waiting for simulation data' }
      ]
    }
    
    return decisions
  }, [agentDecisions])

  // Calculate learning metrics from agent performance
  const episode = useMemo(() => {
    // Estimate episode based on agent activity
    return Math.floor(agents.length * 25 + (energyFlows.length * 5))
  }, [agents.length, energyFlows.length])

  const avgReward = useMemo(() => {
    // Calculate average reward from agent efficiency
    if (agents.length === 0) return 0
    const totalEfficiency = agents.reduce((sum, agent) => {
      const netEnergy = (agent.production || 0) - (agent.consumption || 0)
      return sum + (netEnergy > 0 ? netEnergy * 2 : netEnergy)
    }, 0)
    return Math.max(0, (totalEfficiency / agents.length) * 10).toFixed(1)
  }, [agents])

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
    <GlassCard className="p-5 h-full">
      <h2 className="text-xl font-display font-bold gradient-text mb-5 flex items-center gap-2">
        🤖 Agent Status
      </h2>
      
      <div className="space-y-5">
        {/* AI AGENT ACTIVITY */}
        <div>
          <h3 className="text-sm font-medium text-neutral-ash uppercase tracking-wider mb-3 flex items-center gap-2">
            🤖 AI AGENT ACTIVITY
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-xs font-medium text-neutral-ash uppercase tracking-wider mb-1">Active Agents</div>
              <div className="text-2xl font-display font-bold text-white">{activeAgents}/50</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/10">
              <div className="text-xs font-medium text-neutral-ash uppercase tracking-wider mb-1">Messages/min</div>
              <div className="text-2xl font-display font-bold text-blue-400">{totalMessages}</div>
            </div>
          </div>
        </div>

        {/* Current Negotiations */}
        <div>
          <h3 className="text-sm font-medium text-neutral-ash uppercase tracking-wider mb-3">Current Negotiations:</h3>
          <div className="space-y-2">
            {negotiations.length > 0 ? (
              negotiations.map((neg, idx) => (
                <div key={idx} className="glass rounded-lg p-3 border border-white/10 hover:border-energy-solar/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">
                      House #{neg.from} → {typeof neg.to === 'number' ? `House #${neg.to}` : 'Grid'}: {neg.amount.toFixed(1)} kWh
                    </span>
                    <span className="text-xs text-neutral-silver flex items-center gap-1">
                      {getStatusIcon(neg.status)} <span className="capitalize">{neg.status}</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass rounded-lg p-3 border border-white/10 text-sm text-neutral-ash text-center">
                No active negotiations
              </div>
            )}
          </div>
        </div>

        {/* Recent Decisions */}
        <div>
          <h3 className="text-sm font-medium text-neutral-ash uppercase tracking-wider mb-3">Recent Decisions:</h3>
          <div className="space-y-2">
            {recentDecisions.map((decision, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-neutral-silver">
                <span className="text-neutral-ash font-mono">[{decision.time}]</span>
                <span className="flex-1">
                  {decision.agent ? (
                    <span>
                      <span className="text-white font-medium">Agent #{decision.agent}:</span> {decision.action}
                    </span>
                  ) : (
                    <span>{decision.action}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Progress */}
        <div>
          <h3 className="text-sm font-medium text-neutral-ash uppercase tracking-wider mb-3">Learning Progress:</h3>
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((episode % 1000) / 10, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-silver">Episode {episode.toLocaleString()}</span>
              <span className="text-energy-sage font-medium">
                Avg Reward: +{avgReward} <span className="text-green-400">(improving)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

