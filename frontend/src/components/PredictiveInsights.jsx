import React from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'

export default function PredictiveInsights({ metrics, forecast }) {
  const insights = [
    {
      type: 'optimization',
      title: 'Peak Production Window',
      description: 'Optimal energy sharing expected between 12:00-14:00',
      impact: 'high',
      icon: '⚡',
    },
    {
      type: 'warning',
      title: 'Low Battery Alert',
      description: '5 agents below 20% capacity - recommend grid backup',
      impact: 'medium',
      icon: '⚠️',
    },
    {
      type: 'opportunity',
      title: 'Trading Opportunity',
      description: 'High surplus predicted - consider increasing peer-to-peer trades',
      impact: 'high',
      icon: '💡',
    },
  ]

  return (
    <GlassCard className="col-span-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold gradient-text">🔮 Predictive Insights</h3>
        <span className="text-xs text-slate-400">AI-Powered Analysis</span>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-xl border ${
              insight.type === 'warning'
                ? 'bg-red-500/10 border-red-500/30'
                : insight.type === 'opportunity'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            } hover:scale-[1.02] transition-transform cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-white">{insight.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    insight.impact === 'high'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {insight.impact} impact
                  </span>
                </div>
                <p className="text-sm text-slate-300">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
