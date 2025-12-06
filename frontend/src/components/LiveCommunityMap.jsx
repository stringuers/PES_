import React, { useState } from 'react'

function House2D({ x, y, status, id, onClick, production, consumption, hovered, onMouseEnter, onMouseLeave }) {
  const color = status === 'surplus' ? '#10b981' : status === 'deficit' ? '#ef4444' : '#fbbf24'
  const size = hovered ? 16 : 12

  return (
    <g
      onClick={() => onClick(id)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={color}
        stroke={hovered ? '#ffffff' : color}
        strokeWidth={hovered ? 3 : 1}
        style={{ filter: 'drop-shadow(0 0 8px ' + color + ')' }}
      />
      {hovered && (
        <text
          x={x}
          y={y - size - 8}
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          #{id}
        </text>
      )}
    </g>
  )
}

function EnergyFlow2D({ fromX, fromY, toX, toY, intensity }) {
  const strokeWidth = Math.max(1, intensity * 3)
  return (
    <line
      x1={fromX}
      y1={fromY}
      x2={toX}
      y2={toY}
      stroke="#60a5fa"
      strokeWidth={strokeWidth}
      opacity={0.6}
      className="animate-pulse"
    />
  )
}

export default function LiveCommunityMap({ agents = [], onHouseClick, energyFlows = [] }) {
  const [hoveredHouse, setHoveredHouse] = useState(null)
  
  // Handle empty agents array
  if (!agents || agents.length === 0) {
    return (
      <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-800 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏘️ NEIGHBORHOOD ENERGY FLOW MAP
          </h2>
        </div>
        <div className="h-[calc(100%-4rem)] flex items-center justify-center">
          <div className="text-slate-400 text-center">
            <p className="text-lg mb-2">No agents available</p>
            <p className="text-sm">Start a simulation to see the map</p>
          </div>
        </div>
      </div>
    )
  }

  const gridSize = Math.ceil(Math.sqrt(Math.max(agents.length, 1)))
  const spacing = 50
  const padding = 40

  const housePositions = agents.map((agent, idx) => {
    const row = Math.floor(idx / gridSize)
    const col = idx % gridSize
    return {
      x: padding + col * spacing,
      y: padding + row * spacing,
      agent
    }
  })

  const svgWidth = Math.max(padding * 2 + (gridSize - 1) * spacing, 200)
  const svgHeight = Math.max(padding * 2 + (gridSize - 1) * spacing, 200)

  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🏘️ NEIGHBORHOOD ENERGY FLOW MAP
        </h2>
      </div>
      <div className="h-[calc(100%-4rem)] relative bg-slate-900">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="absolute inset-0"
        >
          {/* Grid lines */}
          {Array.from({ length: gridSize + 1 }).map((_, i) => (
            <React.Fragment key={i}>
              <line
                x1={padding}
                y1={padding + i * spacing}
                x2={padding + (gridSize - 1) * spacing}
                y2={padding + i * spacing}
                stroke="#334155"
                strokeWidth="0.5"
              />
              <line
                x1={padding + i * spacing}
                y1={padding}
                x2={padding + i * spacing}
                y2={padding + (gridSize - 1) * spacing}
                stroke="#334155"
                strokeWidth="0.5"
              />
            </React.Fragment>
          ))}

          {/* Energy flows */}
          {energyFlows.map((flow, idx) => {
            const fromPos = housePositions.find(p => p.agent.id === flow.from)
            const toPos = housePositions.find(p => p.agent.id === flow.to)
            if (!fromPos || !toPos) return null
            return (
              <EnergyFlow2D
                key={idx}
                fromX={fromPos.x}
                fromY={fromPos.y}
                toX={toPos.x}
                toY={toPos.y}
                intensity={Math.min(flow.amount / 5, 1)}
              />
            )
          })}

          {/* Houses */}
          {housePositions.map((pos) => (
            <House2D
              key={pos.agent.id}
              x={pos.x}
              y={pos.y}
              status={pos.agent.status}
              id={pos.agent.id}
              onClick={onHouseClick}
              production={pos.agent.production || 0}
              consumption={pos.agent.consumption || 0}
              hovered={hoveredHouse === pos.agent.id}
              onMouseEnter={() => setHoveredHouse(pos.agent.id)}
              onMouseLeave={() => setHoveredHouse(null)}
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm p-3 rounded-lg border border-slate-700 z-10">
          <div className="text-sm font-semibold text-white mb-2">Legend:</div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-slate-300">🟢 Generating excess</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-slate-300">🟡 Balanced</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-slate-300">🔴 Needs energy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-blue-400"></div>
              <span className="text-slate-300">→ Energy flow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

