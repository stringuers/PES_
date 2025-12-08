import React from 'react'
import { motion } from 'framer-motion'

export default function EnergyFlow({ from, to, amount, fromPos, toPos }) {
  if (!fromPos || !toPos) return null

  const dx = toPos.x - fromPos.x
  const dy = toPos.y - fromPos.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Energy flow line */}
      <motion.line
        x1={fromPos.x}
        y1={fromPos.y}
        x2={toPos.x}
        y2={toPos.y}
        stroke="url(#energyGradient)"
        strokeWidth={Math.min(amount / 2, 6)}
        strokeDasharray="10 5"
        opacity={0.8}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Animated energy particle */}
      <motion.circle
        r="4"
        fill="#3b82f6"
        initial={{ x: fromPos.x, y: fromPos.y }}
        animate={{
          x: [fromPos.x, toPos.x],
          y: [fromPos.y, toPos.y],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </motion.g>
  )
}
