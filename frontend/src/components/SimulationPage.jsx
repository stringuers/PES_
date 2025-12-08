import React, { useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'

export default function SimulationPage({ agents = [], status, onStart, onStop, onPause }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.id?.toString().includes(searchQuery) || 
                         searchQuery === ''
    const matchesFilter = filterStatus === 'all' || 
                         agent.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Calculate summary stats
  const stats = {
    total: agents.length,
    balanced: agents.filter(a => a.status === 'balanced').length,
    importing: agents.filter(a => a.status === 'deficit' || a.production < a.consumption).length,
    exporting: agents.filter(a => a.status === 'surplus' || a.production > a.consumption).length,
  }

  const getBatteryColor = (level) => {
    if (level > 60) return 'bg-green-500'
    if (level > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusBadge = (agent) => {
    const net = (agent.production || 0) - (agent.consumption || 0)
    if (net > 1) return { text: 'Exporting', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    if (net < -1) return { text: 'Importing', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    return { text: 'Balanced', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            🏠 Simulation Control
          </h1>
          <p className="text-slate-400">
            Monitor and control all agents in the community
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status?.status === 'running' ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPause}
                className="px-6 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg font-semibold hover:bg-yellow-500/30"
              >
                ⏸ Pause
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStop}
                className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/30"
              >
                ⏹ Stop
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold shadow-lg shadow-green-500/50"
            >
              ▶ Start Simulation
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard>
          <div className="text-sm text-slate-400 mb-1">Total Agents</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-slate-400 mb-1">Balanced</div>
          <div className="text-3xl font-bold text-blue-400">{stats.balanced}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-slate-400 mb-1">Importing</div>
          <div className="text-3xl font-bold text-red-400">{stats.importing}</div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm text-slate-400 mb-1">Exporting</div>
          <div className="text-3xl font-bold text-green-400">{stats.exporting}</div>
        </GlassCard>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 glass rounded-lg px-4 py-2 flex items-center gap-2">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search homes, agents, metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-400"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'balanced', 'importing', 'exporting'].map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === filter
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'glass text-slate-300 hover:bg-white/10'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent, idx) => {
          const batteryLevel = agent.battery_level 
            ? (agent.battery_level / (agent.battery_capacity || 10)) * 100 
            : 50
          const statusBadge = getStatusBadge(agent)
          const agentNames = [
            'Smith Residence', 'Johnson Home', 'Williams House', 'Brown Family',
            'Jones Place', 'Garcia Home', 'Miller House', 'Davis Residence',
            'Rodriguez Home', 'Martinez Place', 'Hernandez House', 'Lopez Family'
          ]
          const agentName = agentNames[agent.id % agentNames.length] || `Agent #${agent.id}`

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard className="hover:scale-105 transition-transform cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white">{agentName}</h3>
                    <p className="text-xs text-slate-400">ID: home-{agent.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                    {statusBadge.text}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Production */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>☀️</span>
                      <span className="text-sm">Production</span>
                    </div>
                    <span className="font-bold text-white">
                      {(agent.production || 0).toFixed(1)} kW
                    </span>
                  </div>

                  {/* Usage */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>⚡</span>
                      <span className="text-sm">Usage</span>
                    </div>
                    <span className="font-bold text-white">
                      {(agent.consumption || 0).toFixed(1)} kW
                    </span>
                  </div>

                  {/* Battery */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>🔋</span>
                        <span className="text-sm">Battery</span>
                      </div>
                      <span className="font-bold text-white">
                        {batteryLevel.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-2 ${getBatteryColor(batteryLevel)} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${batteryLevel}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                      />
                    </div>
                  </div>

                  {/* P2P Sharing */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <span className="text-sm text-slate-400">P2P Sharing</span>
                    <span className={`text-xs font-medium ${
                      (agent.production || 0) > (agent.consumption || 0) 
                        ? 'text-green-400' 
                        : 'text-slate-500'
                    }`}>
                      {(agent.production || 0) > (agent.consumption || 0) ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {filteredAgents.length === 0 && (
        <GlassCard className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <div className="text-xl font-bold text-white mb-2">No agents found</div>
          <div className="text-slate-400">Try adjusting your search or filters</div>
        </GlassCard>
      )}
    </div>
  )
}
