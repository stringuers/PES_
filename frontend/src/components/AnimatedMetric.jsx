import React, { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

/**
 * Premium Animated Metric Card
 * Features: Smooth number animations, gradient text, trend indicators
 * Design: Clean, minimal, with warm color palette
 */
export default function AnimatedMetric({ 
  value, 
  label, 
  unit = '', 
  icon,
  color = 'amber',
  trend,
  delay = 0 
}) {
  const ref = useRef(null)
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, (current) => 
    typeof value === 'number' && value % 1 !== 0 
      ? current.toFixed(1) 
      : Math.round(current)
  )

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  // New warm color palette (no blue/purple)
  const colorClasses = {
    amber: 'text-energy-solar',
    gold: 'text-energy-gold',
    sage: 'text-energy-sage',
    forest: 'text-energy-forest',
    mint: 'text-energy-mint',
    coral: 'text-accent-coral',
    peach: 'text-accent-peach',
    sunset: 'text-accent-sunset',
    silver: 'text-neutral-silver',
  }

  const glowClasses = {
    amber: 'hover:shadow-glow-amber',
    gold: 'hover:shadow-glow-gold',
    sage: 'hover:shadow-glow-sage',
    forest: 'hover:shadow-glow-sage',
    mint: 'hover:shadow-glow-sage',
    coral: '',
    peach: '',
    sunset: '',
    silver: '',
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ 
        y: -4, 
        transition: { duration: 0.3 } 
      }}
      className={`glass-card group relative overflow-hidden ${glowClasses[color] || ''}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-energy-solar/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          {icon && (
            <motion.div
              className={`text-3xl ${colorClasses[color] || 'text-energy-solar'}`}
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {icon}
            </motion.div>
          )}
          {trend !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-1 text-sm font-medium ${
                trend > 0 ? 'text-energy-sage' : 'text-accent-coral'
              }`}
            >
              <motion.span
                animate={{ y: trend > 0 ? [-2, 0, -2] : [2, 0, 2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {trend > 0 ? '↑' : '↓'}
              </motion.span>
              {Math.abs(trend).toFixed(1)}%
            </motion.div>
          )}
        </div>
        
        <div className={`text-4xl font-bold font-display mb-2 ${colorClasses[color] || 'text-energy-solar'}`}>
          <motion.span>{display}</motion.span>
          {unit && <span className="text-xl ml-1 text-neutral-silver">{unit}</span>}
        </div>
        
        <div className="text-sm font-medium text-neutral-ash uppercase tracking-wide">
          {label}
        </div>
      </div>
    </motion.div>
  )
}
