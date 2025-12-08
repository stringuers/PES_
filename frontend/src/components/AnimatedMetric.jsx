import React, { useEffect, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export default function AnimatedMetric({ 
  value, 
  label, 
  unit = '', 
  icon,
  color = 'blue',
  trend,
  delay = 0 
}) {
  const ref = useRef(null)
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, (current) => Math.round(current))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    red: 'text-red-400',
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card group"
    >
      <div className="flex items-center justify-between mb-2">
        {icon && (
          <div className={`text-2xl ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
        {trend && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-sm flex items-center gap-1 ${
              trend > 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </motion.div>
        )}
      </div>
      <div className={`text-3xl font-bold ${colorClasses[color]} mb-1`}>
        <motion.span>{display}</motion.span>
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </div>
      <div className="text-sm text-slate-400">{label}</div>
    </motion.div>
  )
}
