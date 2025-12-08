import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EnhancedHeader({ 
  status, 
  onStart, 
  onStop, 
  onRefresh, 
  loading 
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-2xl"
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-2xl"
              >
                ☀️
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/50 to-red-500/50 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text text-shadow">
                Solar Swarm Intelligence
              </h1>
              <p className="text-xs text-slate-400">
                Next-Gen Multi-Agent Energy Optimization
              </p>
            </div>
          </motion.div>

          {/* Status & Controls */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <AnimatePresence mode="wait">
              {status && (
                <motion.div
                  key={status.status}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    status.status === 'running'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-2 h-2 rounded-full ${
                        status.status === 'running' ? 'bg-green-400' : 'bg-slate-400'
                      }`}
                      animate={
                        status.status === 'running'
                          ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {status.status === 'running' ? 'Active' : 'Idle'}
                    {status.current_hour !== undefined && (
                      <span className="text-xs ml-2">
                        Hour {status.current_hour}/{status.total_hours || 24}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 glass rounded-lg text-sm font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              🔄 Refresh
            </motion.button>

            {status?.status === 'running' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStop}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-sm font-semibold shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-all disabled:opacity-50"
              >
                ⏹ Stop
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-sm font-semibold shadow-lg shadow-green-500/50 hover:shadow-green-500/70 transition-all disabled:opacity-50"
              >
                ▶ Start Simulation
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
