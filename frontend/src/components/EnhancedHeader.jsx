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

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search homes, agents, metrics..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-400 text-sm"
              />
            </div>
          </div>

          {/* Status & Controls */}
          <div className="flex items-center gap-3">
            {/* Status Indicators */}
            <AnimatePresence mode="wait">
              {status && (
                <>
                  <motion.div
                    key={status.status}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg text-sm"
                  >
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
                    <span className="text-slate-300">
                      {status.status === 'running' ? 'Running 1x' : 'Idle'}
                    </span>
                  </motion.div>
                  
                  <div className="text-sm text-slate-400">
                    {new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit',
                      hour12: false 
                    })}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-slate-300">
                    <span>☀️</span>
                    <span>Sunny Day</span>
                  </div>
                </>
              )}
            </AnimatePresence>

            {/* Action Icons */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 glass rounded-lg flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
            >
              🔔
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 glass rounded-lg flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
            >
              ⚡
            </motion.button>

            {/* Main Action Button */}
            {status?.status === 'running' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStop}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg text-sm font-semibold shadow-lg shadow-orange-500/50 hover:shadow-orange-500/70 transition-all disabled:opacity-50"
              >
                ⏸ Pause
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-sm font-semibold shadow-lg shadow-green-500/50 hover:shadow-green-500/70 transition-all disabled:opacity-50"
              >
                ▶ Start
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
