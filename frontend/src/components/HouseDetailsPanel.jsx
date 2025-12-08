import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from './GlassCard'

export default function HouseDetailsPanel({ house, onClose, isVisible }) {
  if (!house || !isVisible) return null

  const batteryLevel = house.battery_level 
    ? (house.battery_level / (house.battery_capacity || 10)) * 100 
    : 0
  
  const netEnergy = (house.production || 0) - (house.consumption || 0)
  const status = netEnergy > 1 ? 'Exporting' : netEnergy < -1 ? 'Importing' : 'Balanced'

  const agentNames = [
    'Smith Residence', 'Johnson Home', 'Williams House', 'Brown Family',
    'Jones Place', 'Garcia Home', 'Miller House', 'Davis Residence',
    'Rodriguez Home', 'Martinez Place', 'Hernandez House', 'Lopez Family'
  ]
  const houseName = agentNames[house.id % agentNames.length] || `Agent #${house.id}`

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-6 top-24 z-50 w-96"
        >
          <GlassCard className="p-6 border-2 border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold gradient-text">{houseName}</h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full glass flex items-center justify-center text-xl hover:bg-red-500/20"
              >
                ×
              </motion.button>
            </div>

            {/* Status Badge */}
            <div className={`mb-6 px-4 py-2 rounded-lg text-center font-semibold ${
              status === 'Exporting' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : status === 'Importing'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {status}
            </div>

            {/* Energy Metrics */}
            <div className="space-y-4 mb-6">
              <div className="glass p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-2xl">☀️</span>
                    <span>Production</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">
                    {(house.production || 0).toFixed(2)} kW
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <motion.div
                    className="h-2 bg-yellow-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((house.production || 0) / 5 * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-2xl">⚡</span>
                    <span>Consumption</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">
                    {(house.consumption || 0).toFixed(2)} kW
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <motion.div
                    className="h-2 bg-blue-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((house.consumption || 0) / 5 * 100, 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-2xl">🔋</span>
                    <span>Battery</span>
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    {batteryLevel.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3 mt-2">
                  <motion.div
                    className={`h-3 rounded-full ${
                      batteryLevel > 60 ? 'bg-green-500' : 
                      batteryLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${batteryLevel}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {house.battery_level?.toFixed(2) || 0} / {house.battery_capacity || 10} kWh
                </div>
              </div>
            </div>

            {/* Net Energy */}
            <div className={`glass p-4 rounded-lg mb-4 ${
              netEnergy > 0 ? 'border border-green-500/30' : 'border border-red-500/30'
            }`}>
              <div className="text-sm text-slate-400 mb-1">Net Energy</div>
              <div className={`text-3xl font-bold ${
                netEnergy > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {netEnergy > 0 ? '+' : ''}{netEnergy.toFixed(2)} kW
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {netEnergy > 0 ? 'Surplus available' : 'Deficit to cover'}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass p-3 rounded-lg text-center">
                <div className="text-xs text-slate-400 mb-1">ID</div>
                <div className="font-bold text-white">#{house.id}</div>
              </div>
              <div className="glass p-3 rounded-lg text-center">
                <div className="text-xs text-slate-400 mb-1">Capacity</div>
                <div className="font-bold text-white">{house.battery_capacity || 10} kWh</div>
              </div>
            </div>

            {/* P2P Status */}
            <div className="mt-4 glass p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">P2P Sharing</span>
                <span className={`font-semibold ${
                  netEnergy > 0 ? 'text-green-400' : 'text-slate-500'
                }`}>
                  {netEnergy > 0 ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
