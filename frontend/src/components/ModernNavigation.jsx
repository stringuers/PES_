import React from 'react'
import { motion } from 'framer-motion'

export default function ModernNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'intelligence', label: 'AI Intelligence', icon: '🤖' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'insights', label: 'Insights', icon: '🔮' },
  ]

  return (
    <nav className="px-6 pt-4 pb-2 border-b border-white/10">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-6 py-3 rounded-t-xl font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
            
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-t-xl border-t border-x border-white/20"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </nav>
  )
}
