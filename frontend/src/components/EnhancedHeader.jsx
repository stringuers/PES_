import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Premium Enhanced Header
 * Design: Classy, warm tones, elegant spacing
 * Features: Animated logo, status indicators, premium buttons
 */
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
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-premium"
    >
      <div className="px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-5"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-energy-solar via-energy-gold to-accent-sunset flex items-center justify-center text-3xl shadow-glow-amber"
              >
                ☀️
              </motion.div>
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-energy-solar/40 to-accent-sunset/40 blur-xl"
                animate={{ 
                  scale: [1, 1.3, 1], 
                  opacity: [0.4, 0.7, 0.4] 
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold gradient-text text-shadow-lg">
                Solar Swarm Intelligence
              </h1>
              <p className="text-sm text-neutral-silver mt-1 font-medium">
                Next-Gen Multi-Agent Energy Optimization
              </p>
            </div>
          </motion.div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-10">
            <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3 border border-white/10 hover:border-energy-solar/30 transition-all duration-300">
              <span className="text-neutral-silver text-xl">🔍</span>
              <input
                type="text"
                placeholder="Search homes, agents, metrics..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-ash font-medium"
              />
              <kbd className="hidden md:inline-flex px-2 py-1 text-xs font-mono font-semibold text-neutral-ash bg-white/5 rounded border border-white/10">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Status & Controls */}
          <div className="flex items-center gap-4">
            {/* Status Indicators */}
            <AnimatePresence mode="wait">
              {status && (
                <>
                  <motion.div
                    key={status.status}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 px-4 py-2.5 glass rounded-2xl border border-white/10"
                  >
                    <motion.div
                      className={`w-2.5 h-2.5 rounded-full ${
                        status.status === 'running' ? 'bg-energy-sage' : 'bg-neutral-ash'
                      }`}
                      animate={
                        status.status === 'running'
                          ? { 
                              scale: [1, 1.4, 1], 
                              opacity: [1, 0.6, 1],
                              boxShadow: [
                                '0 0 0 0 rgba(132, 169, 140, 0.4)',
                                '0 0 0 8px rgba(132, 169, 140, 0)',
                                '0 0 0 0 rgba(132, 169, 140, 0)'
                              ]
                            }
                          : {}
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-sm font-semibold text-white">
                      {status.status === 'running' ? 'Active' : 'Idle'}
                    </span>
                  </motion.div>
                  
                  <div className="text-sm font-mono font-medium text-neutral-silver px-4 py-2.5 glass rounded-2xl border border-white/10">
                    {new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit',
                      hour12: false 
                    })}
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2.5 glass rounded-2xl border border-white/10">
                    <span className="text-lg">☀️</span>
                    <span className="text-sm font-semibold text-white">Sunny Day</span>
                  </div>
                </>
              )}
            </AnimatePresence>

            {/* Action Icons */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl hover:bg-white/10 hover:border-energy-solar/30 border border-white/10 transition-all duration-300"
            >
              🔔
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={loading}
              className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl hover:bg-white/10 hover:border-energy-solar/30 border border-white/10 transition-all duration-300 disabled:opacity-40"
            >
              ⚡
            </motion.button>

            {/* Main Action Button */}
            {status?.status === 'running' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStop}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-accent-coral to-accent-sunset rounded-2xl font-display font-semibold text-white shadow-lg shadow-accent-coral/30 hover:shadow-xl hover:shadow-accent-coral/50 transition-all duration-300 disabled:opacity-50 border border-white/10"
              >
                ⏸ Pause
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStart}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-energy-sage to-energy-forest rounded-2xl font-display font-semibold text-white shadow-lg shadow-energy-sage/30 hover:shadow-xl hover:shadow-energy-sage/50 transition-all duration-300 disabled:opacity-50 border border-white/10"
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
