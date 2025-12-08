import React from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'

export default function EnhancedPredictiveInsights({ metrics, forecast }) {
  const insights = [
    {
      type: 'optimization',
      title: 'Peak Production Window',
      description: 'Optimal energy sharing expected between 12:00-14:00',
      impact: 'high',
      icon: '⚡',
      color: 'blue',
    },
    {
      type: 'warning',
      title: 'Low Battery Alert',
      description: 'Battery is below 20% capacity - recommend grid backup',
      impact: 'medium',
      icon: '⚠️',
      color: 'red',
    },
    {
      type: 'opportunity',
      title: 'Trading Opportunity',
      description: 'High surplus predicted - consider increasing peer-to-peer trades',
      impact: 'high',
      icon: '💡',
      color: 'green',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30',
    red: 'bg-accent-coral/10 border-accent-coral/30',
    green: 'bg-energy-sage/10 border-energy-sage/30',
  }

  const impactColors = {
    high: 'bg-purple-500/20 text-purple-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    low: 'bg-blue-500/20 text-blue-300',
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold gradient-text flex items-center gap-2">
          💡 Predictive Insights
        </h3>
        <span className="text-xs font-medium text-neutral-ash uppercase tracking-wider">
          AI-Powered Analysis
        </span>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-xl border ${colorClasses[insight.color]} hover:scale-[1.02] transition-all cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display font-semibold text-white">{insight.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${impactColors[insight.impact]}`}>
                    {insight.impact} impact
                  </span>
                </div>
                <p className="text-sm text-neutral-silver leading-relaxed">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
