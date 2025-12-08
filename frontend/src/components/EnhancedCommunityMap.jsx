import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

function House({ position, agent, index, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  // Determine color based on agent status
  const getColor = () => {
    if (!agent) return '#64748b'
    const net = agent.production - agent.consumption
    if (net > 1) return '#10b981' // Green - surplus
    if (net < -1) return '#ef4444' // Red - deficit
    return '#fbbf24' // Yellow - balanced
  }

  const batteryLevel = agent ? (agent.battery_level / agent.battery_capacity) * 100 : 0

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1
      
      // Pulsing glow for active agents
      if (agent && Math.abs(agent.production - agent.consumption) > 0.5) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1
        meshRef.current.scale.setScalar(scale)
      }
    }
  })

  return (
    <group
      position={position}
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onClick && onClick(agent?.id)}
    >
      {/* House base */}
      <mesh>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Battery indicator */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, batteryLevel / 50, 8]} />
        <meshStandardMaterial
          color={batteryLevel > 50 ? '#10b981' : batteryLevel > 20 ? '#fbbf24' : '#ef4444'}
          emissive={batteryLevel > 50 ? '#10b981' : batteryLevel > 20 ? '#fbbf24' : '#ef4444'}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Energy flow indicator */}
      {agent && Math.abs(agent.production - agent.consumption) > 1 && (
        <mesh position={[0, 0.8, 0]}>
          <ringGeometry args={[0.3, 0.35, 16]} />
          <meshStandardMaterial
            color={agent.production > agent.consumption ? '#3b82f6' : '#ef4444'}
            emissive={agent.production > agent.consumption ? '#3b82f6' : '#ef4444'}
            emissiveIntensity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

function EnergyFlowLine({ from, to, amount }) {
  const lineRef = useRef()
  
  useFrame((state) => {
    if (lineRef.current) {
      // Animate energy flow
      const offset = (state.clock.elapsedTime * 0.5) % 1
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...from, ...to])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.6}
        linewidth={Math.min(amount / 2, 3)}
      />
    </line>
  )
}

export default function EnhancedCommunityMap({ agents, energyFlows, onHouseClick }) {
  const [gridSize] = useState([10, 5]) // 10x5 grid for 50 houses
  
  // Calculate positions for agents in a grid
  const getPositions = () => {
    const positions = []
    const spacing = 2
    const startX = -(gridSize[0] * spacing) / 2
    const startZ = -(gridSize[1] * spacing) / 2
    
    for (let i = 0; i < 50; i++) {
      const row = Math.floor(i / gridSize[0])
      const col = i % gridSize[0]
      positions.push([
        startX + col * spacing,
        0,
        startZ + row * spacing,
      ])
    }
    return positions
  }

  const positions = getPositions()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-[600px] rounded-2xl overflow-hidden glass border border-white/20"
    >
      <Canvas shadows camera={{ position: [15, 15, 15], fov: 60 }}>
        <PerspectiveCamera makeDefault position={[15, 15, 15]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={50}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#fbbf24" />
        
        {/* Environment */}
        <Environment preset="night" />
        
        {/* Grid floor */}
        <gridHelper args={[30, 30, '#1e293b', '#334155']} />
        
        {/* Houses */}
        {positions.map((pos, idx) => (
          <House
            key={idx}
            position={pos}
            agent={agents.find(a => a.id === idx)}
            index={idx}
            onClick={onHouseClick}
          />
        ))}
        
        {/* Energy flows */}
        {energyFlows.map((flow, idx) => {
          const fromAgent = agents.find(a => a.id === flow.from)
          const toAgent = agents.find(a => a.id === flow.to)
          if (!fromAgent || !toAgent) return null
          
          const fromIdx = flow.from
          const toIdx = flow.to
          const fromPos = positions[fromIdx]
          const toPos = positions[toIdx]
          
          return (
            <EnergyFlowLine
              key={idx}
              from={fromPos}
              to={toPos}
              amount={flow.amount || 0}
            />
          )
        })}
      </Canvas>
    </motion.div>
  )
}
