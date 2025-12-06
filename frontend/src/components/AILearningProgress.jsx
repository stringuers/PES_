import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function AILearningProgress({ agents = [] }) {
  const [episode, setEpisode] = useState(1245)
  const [avgReward, setAvgReward] = useState(18.3)
  const [learningRate, setLearningRate] = useState(0.0003)
  
  // Simulate learning progress
  useEffect(() => {
    const interval = setInterval(() => {
      setEpisode(prev => prev + 1)
      setAvgReward(prev => prev + (Math.random() - 0.4) * 0.5)
      setLearningRate(prev => Math.max(0.0001, prev * 0.9999))
    }, 2000)
    return () => clearInterval(interval)
  }, [])
  
  // Learning curve data
  const learningCurve = React.useMemo(() => {
    const episodes = []
    for (let i = episode - 100; i <= episode; i += 10) {
      episodes.push({
        episode: i,
        reward: 10 + (i / 100) + Math.sin(i / 50) * 2,
        exploration: Math.max(0.1, 1 - (i / 2000)),
        exploitation: Math.min(0.9, i / 2000)
      })
    }
    return episodes
  }, [episode])
  
  // Agent performance radar
  const agentPerformance = [
    { metric: 'Energy Efficiency', value: 87 },
    { metric: 'Cost Savings', value: 92 },
    { metric: 'Sharing Rate', value: 78 },
    { metric: 'Battery Usage', value: 85 },
    { metric: 'Grid Independence', value: 88 },
    { metric: 'Response Time', value: 90 }
  ]
  
  // Reward distribution
  const rewardDistribution = [
    { range: '0-5', count: 2 },
    { range: '5-10', count: 5 },
    { range: '10-15', count: 12 },
    { range: '15-20', count: 18 },
    { range: '20-25', count: 10 },
    { range: '25+', count: 3 }
  ]
  
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        📈 AI LEARNING PROGRESS
      </h2>
      
      <div className="space-y-4">
        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-xs text-slate-400">Episode</div>
            <div className="text-xl font-bold text-blue-400">{episode.toLocaleString()}</div>
          </div>
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-xs text-slate-400">Avg Reward</div>
            <div className="text-xl font-bold text-green-400">+{avgReward.toFixed(1)}</div>
          </div>
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-xs text-slate-400">Learning Rate</div>
            <div className="text-xl font-bold text-yellow-400">{learningRate.toFixed(6)}</div>
          </div>
        </div>
        
        {/* Learning Curve */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Learning Curve (Last 100 episodes):</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={learningCurve}>
              <defs>
                <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="episode" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area
                type="monotone"
                dataKey="reward"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorReward)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Performance Radar */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Agent Performance Metrics:</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={agentPerformance}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Exploration vs Exploitation */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Exploration vs Exploitation:</div>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-700/50 rounded p-2">
              <div className="text-xs text-slate-400 mb-1">Exploration</div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${learningCurve[learningCurve.length - 1]?.exploration * 100 || 10}%` }}
                />
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {(learningCurve[learningCurve.length - 1]?.exploration * 100 || 10).toFixed(1)}%
              </div>
            </div>
            <div className="flex-1 bg-slate-700/50 rounded p-2">
              <div className="text-xs text-slate-400 mb-1">Exploitation</div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${learningCurve[learningCurve.length - 1]?.exploitation * 100 || 90}%` }}
                />
              </div>
              <div className="text-xs text-slate-300 mt-1">
                {(learningCurve[learningCurve.length - 1]?.exploitation * 100 || 90).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

