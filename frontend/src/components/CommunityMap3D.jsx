import React, { useRef, useState, useMemo } from 'react'

// Try to import Three.js components, fallback to 2D if not available
let Canvas, useFrame, OrbitControls, Text, Line, Sphere, Box, Environment, THREE
let threeAvailable = false

try {
  const threeFiber = require('@react-three/fiber')
  const drei = require('@react-three/drei')
  THREE = require('three')
  Canvas = threeFiber.Canvas
  useFrame = threeFiber.useFrame
  OrbitControls = drei.OrbitControls
  Text = drei.Text
  Line = drei.Line
  Sphere = drei.Sphere
  Box = drei.Box
  Environment = drei.Environment
  threeAvailable = true
} catch (e) {
  console.warn('Three.js not available, using 2D fallback')
  threeAvailable = false
}

function House3D({ position, status, id, production, consumption, batteryLevel, onClick, isHovered }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  const color = status === 'surplus' ? '#10b981' : status === 'deficit' ? '#ef4444' : '#fbbf24'
  const intensity = production / 5 // Normalize to 0-1
  
  if (useFrame) {
    useFrame((state) => {
      if (meshRef.current) {
        // Subtle pulsing animation for active houses
        if (production > 0) {
          meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05)
        }
      }
    })
  }
  
  return (
    <group position={position} ref={meshRef}>
      {/* House base */}
      <Box
        args={[1, 0.8, 1]}
        onClick={() => onClick(id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.5}
          metalness={0.3}
          roughness={0.4}
        />
      </Box>
      
      {/* Solar panel on roof */}
      {production > 0 && (
        <Box position={[0, 0.6, 0]} args={[1.2, 0.1, 1.2]}>
          <meshStandardMaterial
            color="#1e40af"
            emissive="#3b82f6"
            emissiveIntensity={intensity * 0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
      )}
      
      {/* Battery indicator */}
      <Sphere position={[0, -0.6, 0]} args={[0.2, 16, 16]}>
        <meshStandardMaterial
          color={batteryLevel > 50 ? '#10b981' : batteryLevel > 20 ? '#fbbf24' : '#ef4444'}
          emissive={batteryLevel > 50 ? '#10b981' : batteryLevel > 20 ? '#fbbf24' : '#ef4444'}
          emissiveIntensity={0.3}
        />
      </Sphere>
      
      {/* Energy production indicator */}
      {production > 0 && (
        <Sphere position={[0, 1.2, 0]} args={[0.15, 16, 16]}>
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={intensity}
          />
        </Sphere>
      )}
      
      {/* Hover label */}
      {(hovered || isHovered) && (
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {`House #${id}\n${production.toFixed(1)}kW`}
        </Text>
      )}
    </group>
  )
}

function EnergyFlow3D({ from, to, amount, positions }) {
  const fromPos = positions[from]
  const toPos = positions[to]
  
  if (!fromPos || !toPos || !THREE) return null
  
  const points = [fromPos, toPos]
  const intensity = Math.min(amount / 5, 1)
  const color = new THREE.Color(0x60a5fa)
  
  return (
    <Line
      points={points}
      color={color}
      lineWidth={intensity * 5}
      dashed={false}
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity * 0.5}
        transparent
        opacity={0.7}
      />
    </Line>
  )
}

export default function CommunityMap3D({ agents = [], onHouseClick, energyFlows = [] }) {
  // ALL HOOKS MUST BE CALLED FIRST - before any early returns (Rules of Hooks)
  const [hoveredHouse, setHoveredHouse] = useState(null)
  const controlsRef = useRef()
  
  // Calculate grid size and spacing
  const gridSize = Math.ceil(Math.sqrt(Math.max(agents?.length || 0, 1)))
  const spacing = 3
  
  // Calculate 3D positions - MUST be before any early returns
  const positions = useMemo(() => {
    if (!agents || agents.length === 0) return {}
    const posMap = {}
    agents.forEach((agent, idx) => {
      const row = Math.floor(idx / gridSize)
      const col = idx % gridSize
      posMap[agent.id] = [
        (col - gridSize / 2) * spacing,
        0,
        (row - gridSize / 2) * spacing
      ]
    })
    return posMap
  }, [agents, gridSize, spacing])
  
  // Now safe to do early returns after all hooks
  if (!agents || agents.length === 0) {
    return (
      <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-800 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏘️ 3D NEIGHBORHOOD ENERGY MAP
          </h2>
        </div>
        <div className="h-[calc(100%-4rem)] flex items-center justify-center">
          <div className="text-slate-400 text-center">
            <p className="text-lg mb-2">No agents available</p>
            <p className="text-sm">Start a simulation to see the 3D map</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Fallback to 2D if Three.js not available
  if (!threeAvailable || !Canvas) {
    return (
      <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-800 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏘️ 3D NEIGHBORHOOD ENERGY MAP
          </h2>
          <div className="text-xs text-yellow-400 mt-2">
            ⚠️ 3D visualization requires Three.js. Install: npm install three @react-three/fiber @react-three/drei
          </div>
        </div>
        <div className="h-[calc(100%-4rem)] flex items-center justify-center">
          <div className="text-slate-400 text-center">
            <p className="text-lg mb-2">3D visualization unavailable</p>
            <p className="text-sm">Please install Three.js dependencies</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full h-full bg-slate-900 rounded-lg overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🏘️ 3D NEIGHBORHOOD ENERGY MAP
        </h2>
        <div className="text-xs text-slate-400">
          Click and drag to rotate • Scroll to zoom
        </div>
      </div>
      <div className="h-[calc(100%-4rem)] relative">
        <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />
          
          {/* Ground grid */}
          <gridHelper args={[gridSize * spacing, gridSize, '#334155', '#1e293b']} />
          
          {/* Energy flows */}
          {energyFlows.map((flow, idx) => (
            <EnergyFlow3D
              key={idx}
              from={flow.from}
              to={flow.to}
              amount={flow.amount || 0}
              positions={positions}
            />
          ))}
          
          {/* Houses */}
          {agents.map((agent) => (
            <House3D
              key={agent.id}
              position={positions[agent.id]}
              status={agent.status}
              id={agent.id}
              production={agent.production || 0}
              consumption={agent.consumption || 0}
              batteryLevel={(agent.battery_level / agent.battery_capacity) * 100 || 50}
              onClick={onHouseClick}
              isHovered={hoveredHouse === agent.id}
            />
          ))}
          
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
          
          <Environment preset="night" />
        </Canvas>
        
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

