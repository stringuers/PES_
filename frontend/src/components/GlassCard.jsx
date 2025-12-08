import React from 'react'
import { motion } from 'framer-motion'

/**
 * Premium Glass Card Component
 * Features: Enhanced glass morphism, smooth animations, hover effects
 * Design: Classy, modern, with warm amber accents
 */
export default function GlassCard({ 
  children, 
  className = '', 
  hover = true,
  glow = false,
  delay = 0,
  onClick,
  ...props 
}) {
  const hoverEffect = hover ? {
    y: -4,
    scale: 1.01,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  } : {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={hoverEffect}
      className={`
        glass-card
        ${glow ? 'card-hover-glow' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}
