import React from 'react'
import { motion } from 'framer-motion'

export default function GlassCard({ 
  children, 
  className = '', 
  hover = true, 
  delay = 0,
  onClick,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      className={`glass-card ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}
