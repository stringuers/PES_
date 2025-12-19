import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Text, Html } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Enhanced House Component with Real City Look
function CityHouse({ 
  position, 
  agent, 
  index, 
  onClick, 
  isSelected,
  energyFlows 
}) {
  const meshRef = useRef()
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Calculate colors based on agent status
  const getHouseColor = () => {
    if (!agent) return '#f97316' // Default orange
    const net = (agent.production || 0) - (agent.consumption || 0)
    if (net > 1) return '#10b981' // Green - exporting
    if (net < -1) return '#ef4444' // Red - importing
    return '#f97316' // Orange - balanced
  }

  const batteryLevel = agent ? ((agent.battery_level || 0) / (agent.battery_capacity || 10)) * 100 : 50
  const houseColor = getHouseColor()
  const isActive = agent && Math.abs((agent.production || 0) - (agent.consumption || 0)) > 0.5

  // Animate house
  useFrame((state) => {
    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.15
      
      // Pulsing for active houses
      if (isActive) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.15
        groupRef.current.scale.setScalar(scale)
      } else {
        groupRef.current.scale.setScalar(1)
      }

      // Rotation for selected house
      if (isSelected) {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
      }
    }

    // Energy flow particles
    if (meshRef.current && energyFlows && energyFlows.length > 0) {
      const relevantFlows = energyFlows.filter(f => f.from === agent?.id || f.to === agent?.id)
      if (relevantFlows.length > 0) {
        meshRef.current.material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2
      }
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick && agent) {
          onClick(agent.id !== undefined ? agent.id : index)
        }
        setShowDetails(!showDetails)
      }}
    >
      {/* House Base - More detailed */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.5, 1.2]} />
        <meshStandardMaterial
          color={houseColor}
          emissive={houseColor}
          emissiveIntensity={hovered ? 0.6 : isActive ? 0.4 : 0.2}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1, 0.8, 4]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#dc2626"
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Windows (glowing) */}
      <mesh position={[-0.4, 0.3, 0.61]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.05]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0.4, 0.3, 0.61]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.05]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Battery Indicator - Vertical bar on side */}
      <mesh position={[0.65, 0, 0]} castShadow>
        <boxGeometry args={[0.1, batteryLevel / 50, 0.1]} />
        <meshStandardMaterial
          color={batteryLevel > 60 ? '#10b981' : batteryLevel > 30 ? '#fbbf24' : '#ef4444'}
          emissive={batteryLevel > 60 ? '#10b981' : batteryLevel > 30 ? '#fbbf24' : '#ef4444'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Energy Flow Indicator Ring */}
      {isActive && (
        <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshStandardMaterial
            color={agent.production > agent.consumption ? '#3b82f6' : '#ef4444'}
            emissive={agent.production > agent.consumption ? '#3b82f6' : '#ef4444'}
            emissiveIntensity={0.6}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Solar Panel on Roof */}
      <mesh position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.6, 0.05, 0.6]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Hover/Selected Glow */}
      {(hovered || isSelected) && (
        <mesh position={[0, 0.75, 0]}>
          <ringGeometry args={[0.8, 1.2, 32]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={hovered ? 0.8 : 0.5}
            side={THREE.DoubleSide}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* House Label */}
      {hovered && (
        <Html position={[0, 2.5, 0]} center>
          <div className="glass px-3 py-1 rounded-lg text-xs font-bold text-white whitespace-nowrap">
            Agent #{agent?.id || index}
            <div className="text-[10px] text-slate-300">
              {agent ? `${(agent.production || 0).toFixed(1)}kW / ${(agent.consumption || 0).toFixed(1)}kW` : 'No data'}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Enhanced Energy Flow with Particles
function EnergyFlowParticle({ fromPos, toPos, progress }) {
  const meshRef = useRef()
  
  useFrame(() => {
    if (meshRef.current) {
      const x = fromPos[0] + (toPos[0] - fromPos[0]) * progress
      const y = fromPos[1] + (toPos[1] - fromPos[1]) * progress + 0.5
      const z = fromPos[2] + (toPos[2] - fromPos[2]) * progress
      meshRef.current.position.set(x, y, z)
    }
  })

  return (
    <mesh ref={meshRef} position={fromPos}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={1}
      />
    </mesh>
  )
}

// Energy Flow Line with Animation
function EnergyFlowLine({ fromPos, toPos, amount, index }) {
  const lineRef = useRef()
  const particleRefs = useRef([])
  const particleProgress = useRef([])

  useEffect(() => {
    // Create multiple particles for the flow
    const particleCount = Math.min(Math.ceil(amount / 2), 5)
    particleProgress.current = Array.from({ length: particleCount }, (_, i) => ({
      progress: (i / particleCount) % 1,
      speed: 0.015 + Math.random() * 0.01,
    }))
  }, [amount])

  useFrame(() => {
    particleProgress.current.forEach((particle) => {
      particle.progress = (particle.progress + particle.speed) % 1
    })
  })

  return (
    <group>
      {/* Animated line */}
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([...fromPos, ...toPos])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.6}
          linewidth={Math.min(amount / 2, 4)}
        />
      </line>

      {/* Flowing particles */}
      {particleProgress.current.map((particle, i) => (
        <EnergyFlowParticle
          key={`${index}-${i}`}
          fromPos={fromPos}
          toPos={toPos}
          progress={particle.progress}
        />
      ))}
    </group>
  )
}

// City Ground/Grid
function CityGround() {
  return (
    <>
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Grid lines */}
      <gridHelper args={[50, 50, '#1e293b', '#334155']} position={[0, 0, 0]} />

      {/* Street lights */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={i}
          position={[
            (i % 5 - 2) * 8,
            1.5,
            Math.floor(i / 5) * 8 - 8
          ]}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
          <meshStandardMaterial color="#64748b" />
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={1}
            />
          </mesh>
        </mesh>
      ))}
    </>
  )
}

export default function City3DMap({ agents, energyFlows, onHouseClick, selectedHouseId }) {
  const [gridSize] = useState([10, 5])
  
  // Calculate city-like positions
  const positions = useMemo(() => {
    const pos = []
    const spacing = 4
    const startX = -(gridSize[0] * spacing) / 2
    const startZ = -(gridSize[1] * spacing) / 2
    
    for (let i = 0; i < 50; i++) {
      const row = Math.floor(i / gridSize[0])
      const col = i % gridSize[0]
      // Add some randomness for more natural city layout
      const offsetX = (Math.random() - 0.5) * 0.5
      const offsetZ = (Math.random() - 0.5) * 0.5
      pos.push([
        startX + col * spacing + offsetX,
        0,
        startZ + row * spacing + offsetZ,
      ])
    }
    return pos
  }, [gridSize])

  // Create flow lines
  const flowLines = useMemo(() => {
    if (!energyFlows || energyFlows.length === 0) return []
    
    return energyFlows.map((flow, idx) => {
      const fromAgent = agents.find(a => a.id === flow.from)
      const toAgent = agents.find(a => a.id === flow.to)
      if (!fromAgent || !toAgent) return null
      
      const fromIdx = flow.from
      const toIdx = flow.to
      if (fromIdx >= positions.length || toIdx >= positions.length) return null
      
      const fromPos = [...positions[fromIdx]]
      fromPos[1] = 1.5 // Height of house
      const toPos = [...positions[toIdx]]
      toPos[1] = 1.5
      
      return {
        id: idx,
        fromPos,
        toPos,
        amount: flow.amount || 0,
      }
    }).filter(Boolean)
  }, [energyFlows, agents, positions])

  // Show placeholder if no agents
  if (!agents || agents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-[700px] rounded-2xl overflow-hidden glass border border-white/20 relative flex items-center justify-center"
      >
        <div className="text-center z-10">
          <div className="text-6xl mb-4">🏘️</div>
          <div className="text-2xl font-bold text-white mb-2">No Simulation Running</div>
          <div className="text-slate-400 mb-6">Start a simulation to see the community energy network</div>
          <div className="text-sm text-slate-500">Click "Start Simulation" button to begin</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-[700px] rounded-2xl overflow-hidden glass border border-white/20 relative"
    >
      <Canvas shadows camera={{ position: [25, 20, 25], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[25, 20, 25]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={15}
          maxDistance={60}
          target={[0, 0, 0]}
        />
        
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <pointLight position={[0, 15, 0]} intensity={0.5} color="#fbbf24" />
        <pointLight position={[-15, 10, -15]} intensity={0.3} color="#3b82f6" />
        <pointLight position={[15, 10, 15]} intensity={0.3} color="#8b5cf6" />
        
        {/* Environment */}
        <Environment preset="night" />
        
        {/* City Ground */}
        <CityGround />
        
        {/* Houses */}
        {agents.map((agent, idx) => {
          // Use agent's actual ID for position lookup, or use index as fallback
          const agentIndex = agent?.id !== undefined ? agent.id : idx
          const position = positions[agentIndex] || positions[idx] || [0, 0, 0]
          
          return (
            <CityHouse
              key={agent.id || idx}
              position={position}
              agent={agent}
              index={idx}
              onClick={onHouseClick}
              isSelected={selectedHouseId === agent.id || selectedHouseId === agentIndex}
              energyFlows={energyFlows}
            />
          )
        })}
        
        {/* Energy Flow Lines */}
        {flowLines.map((flow) => (
          <EnergyFlowLine
            key={flow.id}
            fromPos={flow.fromPos}
            toPos={flow.toPos}
            amount={flow.amount}
            index={flow.id}
          />
        ))}
      </Canvas>

      {/* Overlay Info */}
      <div className="absolute top-4 left-4 glass px-4 py-2 rounded-lg">
        <div className="text-sm text-slate-300">
          <span className="font-bold text-white">{energyFlows?.length || 0}</span> active energy flows
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {agents.length} houses in community
        </div>
      </div>
    </motion.div>
  )
}
