import React, { useMemo } from 'react'
import { Cell } from 'recharts'

export default function AnomalyHeatmap({ agents = [] }) {
  // Create heatmap data from agent anomalies
  const heatmapData = useMemo(() => {
    const gridSize = Math.ceil(Math.sqrt(agents.length))
    const data = []
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const idx = row * gridSize + col
        if (idx < agents.length) {
          const agent = agents[idx]
          // Calculate anomaly score (0-100)
          const expectedProduction = 4.0 // Expected average
          const actualProduction = agent.production || 0
          const anomalyScore = Math.abs(expectedProduction - actualProduction) / expectedProduction * 100
          
          data.push({
            row,
            col,
            agentId: agent.id,
            score: Math.min(anomalyScore, 100),
            status: anomalyScore > 30 ? 'high' : anomalyScore > 15 ? 'medium' : 'low'
          })
        }
      }
    }
    
    return { data, gridSize }
  }, [agents])
  
  const getColor = (score) => {
    if (score > 50) return '#ef4444' // Red - high anomaly
    if (score > 25) return '#f59e0b' // Orange - medium
    if (score > 10) return '#fbbf24' // Yellow - low
    return '#10b981' // Green - normal
  }
  
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Anomaly Detection Heatmap</h3>
      <div className="bg-slate-900 rounded p-4">
        <div
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${heatmapData.gridSize}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: '400px'
          }}
        >
          {heatmapData.data.map((cell) => (
            <div
              key={`${cell.row}-${cell.col}`}
              className="aspect-square rounded"
              style={{
                backgroundColor: getColor(cell.score),
                opacity: 0.8
              }}
              title={`Agent #${cell.agentId}: Anomaly score ${cell.score.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-slate-400">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-slate-400">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-slate-400">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-slate-400">High</span>
          </div>
        </div>
      </div>
    </div>
  )
}

