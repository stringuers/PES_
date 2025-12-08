import React from 'react'
import { motion } from 'framer-motion'
import GlassCard from './GlassCard'

export default function GamificationPanel({ metrics }) {
  const achievements = [
    { id: 1, name: 'Solar Champion', progress: 87, icon: '🏆', unlocked: true },
    { id: 2, name: 'Energy Sharer', progress: 65, icon: '🤝', unlocked: true },
    { id: 3, name: 'Grid Independent', progress: 45, icon: '🔋', unlocked: false },
    { id: 4, name: 'Carbon Neutral', progress: 92, icon: '🌱', unlocked: true },
  ]

  const leaderboard = [
    { rank: 1, agent: 'Agent #12', score: 2450, badge: '🥇' },
    { rank: 2, agent: 'Agent #8', score: 2230, badge: '🥈' },
    { rank: 3, agent: 'Agent #34', score: 2100, badge: '🥉' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      <GlassCard>
        <h3 className="text-lg font-bold mb-4 gradient-text">🏅 Achievements</h3>
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: achievement.id * 0.1 }}
              className={`p-3 rounded-lg border ${
                achievement.unlocked
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{achievement.icon}</span>
                  <span className="font-medium text-sm">{achievement.name}</span>
                </div>
                {achievement.unlocked && (
                  <span className="text-xs text-green-400">✓ Unlocked</span>
                )}
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${achievement.progress}%` }}
                  transition={{ duration: 1, delay: achievement.id * 0.1 }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-1">{achievement.progress}%</div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-bold mb-4 gradient-text">📊 Leaderboard</h3>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: entry.rank * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{entry.badge}</span>
                <div>
                  <div className="font-medium text-sm">{entry.agent}</div>
                  <div className="text-xs text-slate-400">Rank #{entry.rank}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-400">{entry.score}</div>
                <div className="text-xs text-slate-400">points</div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
