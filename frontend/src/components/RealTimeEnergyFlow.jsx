import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'

export default function RealTimeEnergyFlow({ energyFlows, agents }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !energyFlows.length) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = canvas.width = canvas.offsetWidth
    const height = canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw energy flows
    energyFlows.forEach((flow, idx) => {
      const fromAgent = agents.find(a => a.id === flow.from)
      const toAgent = agents.find(a => a.id === flow.to)
      
      if (!fromAgent || !toAgent) return

      // Calculate positions (simplified circular layout)
      const angle1 = (flow.from / agents.length) * Math.PI * 2
      const angle2 = (flow.to / agents.length) * Math.PI * 2
      const radius = Math.min(width, height) * 0.3
      const centerX = width / 2
      const centerY = height / 2

      const x1 = centerX + Math.cos(angle1) * radius
      const y1 = centerY + Math.sin(angle1) * radius
      const x2 = centerX + Math.cos(angle2) * radius
      const y2 = centerY + Math.sin(angle2) * radius

      // Draw flow line
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + (flow.amount || 0) / 10})`
      ctx.lineWidth = Math.min((flow.amount || 0) / 2, 4)
      ctx.stroke()

      // Draw animated particles
      const progress = (Date.now() / 2000 + idx * 0.1) % 1
      const px = x1 + (x2 - x1) * progress
      const py = y1 + (y2 - y1) * progress

      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#3b82f6'
      ctx.fill()
    })

    // Redraw on next frame
    const animationId = requestAnimationFrame(() => {
      useEffect(() => {})
    })
    
    return () => cancelAnimationFrame(animationId)
  }, [energyFlows, agents])

  return (
    <GlassCard className="col-span-full">
      <h3 className="text-xl font-bold mb-4 gradient-text">⚡ Real-Time Energy Network</h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-64 rounded-xl bg-slate-900/50"
        />
        <div className="absolute top-4 right-4 glass px-3 py-1 rounded-lg text-sm">
          {energyFlows.length} Active Flows
        </div>
      </div>
    </GlassCard>
  )
}
