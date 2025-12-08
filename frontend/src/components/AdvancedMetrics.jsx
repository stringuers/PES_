import React from 'react'
import { motion } from 'framer-motion'
import AnimatedMetric from './AnimatedMetric'
import GlassCard from './GlassCard'

export default function AdvancedMetrics({ metrics, forecast }) {
  const metricCards = [
    {
      label: 'Solar Utilization',
      value: metrics?.solar_utilization_pct || 0,
      unit: '%',
      icon: '☀️',
      color: 'yellow',
      trend: 2.3,
    },
    {
      label: 'Self-Sufficiency',
      value: metrics?.self_sufficiency_pct || 0,
      unit: '%',
      icon: '🔋',
      color: 'green',
      trend: 1.8,
    },
    {
      label: 'Cost Savings',
      value: metrics?.cost_savings_daily || 0,
      unit: ' TND',
      icon: '💰',
      color: 'green',
      trend: 5.2,
    },
    {
      label: 'CO₂ Avoided',
      value: metrics?.co2_avoided_kg || 0,
      unit: ' kg',
      icon: '🌱',
      color: 'cyan',
      trend: 3.1,
    },
    {
      label: 'Energy Shared',
      value: metrics?.energy_shared_kwh || 0,
      unit: ' kWh',
      icon: '🤝',
      color: 'purple',
      trend: 4.5,
    },
    {
      label: 'Grid Dependency',
      value: metrics?.grid_dependency_pct || 0,
      unit: '%',
      icon: '⚡',
      color: 'red',
      trend: -2.1,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {metricCards.map((metric, idx) => (
        <AnimatedMetric
          key={idx}
          value={metric.value}
          label={metric.label}
          unit={metric.unit}
          icon={metric.icon}
          color={metric.color}
          trend={metric.trend}
          delay={idx * 0.1}
        />
      ))}
    </div>
  )
}
