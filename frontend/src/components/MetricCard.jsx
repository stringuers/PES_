import React from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function MetricCard({ 
  icon, 
  label, 
  value, 
  unit = '', 
  trend, 
  trendLabel,
  color = 'amber',
  delay = 0 
}) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, (current) => 
    typeof value === 'number' && value % 1 !== 0 
      ? current.toFixed(1) 
      : Math.round(current)
  )

  useEffect(() => {
    spring.set(value || 0)
  }, [value, spring])

  const colorClasses = {
    amber: {
      bg: 'bg-energy-solar/10',
      border: 'border-energy-solar/30',
      text: 'text-energy-solar',
      iconBg: 'bg-energy-solar/20',
    },
    sage: {
      bg: 'bg-energy-sage/10',
      border: 'border-energy-sage/30',
      text: 'text-energy-sage',
      iconBg: 'bg-energy-sage/20',
    },
    mint: {
      bg: 'bg-energy-mint/10',
      border: 'border-energy-mint/30',
      text: 'text-energy-mint',
      iconBg: 'bg-energy-mint/20',
    },
    gold: {
      bg: 'bg-energy-gold/10',
      border: 'border-energy-gold/30',
      text: 'text-energy-gold',
      iconBg: 'bg-energy-gold/20',
    },
    coral: {
      bg: 'bg-accent-coral/10',
      border: 'border-accent-coral/30',
      text: 'text-accent-coral',
      iconBg: 'bg-accent-coral/20',
    },
  }

  const colors = colorClasses[color] || colorClasses.amber

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass rounded-2xl p-5 border ${colors.border} ${colors.bg} hover:scale-105 transition-transform relative overflow-hidden`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center text-2xl`}>
            {icon}
          </div>
          {trend !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                trend > 0 
                  ? 'bg-energy-sage/20 text-energy-sage' 
                  : 'bg-accent-coral/20 text-accent-coral'
              }`}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </motion.div>
          )}
        </div>
        
        <div className="mb-2">
          <div className={`text-3xl font-display font-bold ${colors.text} mb-1`}>
            <motion.span>{display}</motion.span>
            {unit && <span className="text-lg ml-1 font-normal">{unit}</span>}
          </div>
          <div className="text-xs font-semibold text-neutral-ash uppercase tracking-wider">
            {label}
          </div>
        </div>
        
        {trendLabel && (
          <div className="text-xs text-neutral-silver mt-2">
            {trendLabel}
          </div>
        )}
      </div>
    </motion.div>
  )
}
