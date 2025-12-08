import React from 'react'
import { motion } from 'framer-motion'

/**
 * Premium Modern Navigation
 * Design: Clean tabs with smooth transitions, warm accent colors
 * Features: Animated active indicator, hover effects
 */
export default function ModernNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'simulation', label: 'Simulation', icon: '⚡' },
    { id: 'forecasting', label: 'Forecasting', icon: '🔮' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'intelligence', label: 'AI Intelligence', icon: '🤖' },
  ]

  return (
    <nav className="px-8 pt-4 pb-0 border-b border-white/10">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-8 py-4 rounded-t-3xl font-display font-semibold text-sm 
              transition-all duration-300
              ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-neutral-silver hover:text-white'
              }
            `}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center gap-3 relative z-10">
              <motion.span 
                className="text-xl"
                animate={activeTab === tab.id ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {tab.icon}
              </motion.span>
              <span>{tab.label}</span>
            </span>
            
            {activeTab === tab.id && (
              <>
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-br from-energy-solar/15 to-energy-gold/10 rounded-t-3xl border-t-2 border-x border-energy-solar/40"
                  initial={false}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30 
                  }}
                />
                {/* Subtle glow effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-energy-solar/5 to-transparent rounded-t-3xl blur-sm"
                  animate={{
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </>
            )}
          </motion.button>
        ))}
      </div>
    </nav>
  )
}
