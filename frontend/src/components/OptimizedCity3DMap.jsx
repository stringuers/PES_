import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, Text, Html } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Optimized House Component
const CityHouse = React.memo(({ 
  position, 
  agent, 
  index, 
  onClick, 
  isSelected,
  hasActiveFlow
}) => {
  const meshRef = useRef()
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)

  const getHouseColor = () => {
    if (!agent) return '#f97316'
    const net = (agent.production || 0) - (agent.consumption || 0)
    if (net > 1) return '#10b981'
    if (net < -1) return '#ef4444'
    return '#f97316'
  }

  const batteryLevel = agent ? ((agent.battery_level || 0) / (agent.battery_capacity || 10)) * 100 : 50
  const houseColor = getHouseColor()
  const isActive = agent && Math.abs((agent.production || 0) - (agent.consumption || 0)) > 0.5

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1
      
      if (isActive) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1
        groupRef.current.scale.setScalar(scale)
      }

      if (isSelected) {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
      }
    }

    if (meshRef.current && hasActiveFlow) {
      meshRef.current.material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.3
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onClick && onClick(agent?.id)}
    >
      {/* House Base */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.5, 1.2]} />
        <meshStandardMaterial
          color={houseColor}
          emissive={houseColor}
          emissiveIntensity={hovered ? 0.6 : hasActiveFlow ? 0.5 : 0.2}
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
        />
      </mesh>

      {/* Windows */}
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

      {/* Battery Indicator */}
      <mesh position={[0.65, 0, 0]} castShadow>
        <boxGeometry args={[0.1, batteryLevel / 50, 0.1]} />
        <meshStandardMaterial
          color={batteryLevel > 60 ? '#10b981' : batteryLevel > 30 ? '#fbbf24' : '#ef4444'}
          emissive={batteryLevel > 60 ? '#10b981' : batteryLevel > 30 ? '#fbbf24' : '#ef4444'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Energy Flow Indicator */}
      {hasActiveFlow && (
        <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={0.8}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Solar Panel */}
      <mesh position={[0, 1.3, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.6, 0.05, 0.6]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Selection Glow */}
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

      {/* Label */}
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
})

CityHouse.displayName = 'CityHouse'

// Optimized Energy Flow with Better Visualization
const EnergyFlowBeam = React.memo(({ fromPos, toPos, amount, index }) => {
  const tubeRef = useRef()
  const curveRef = useRef()
  const particlesRef = useRef([])

  // Create curve once
  useEffect(() => {
    const points = []
    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = fromPos[0] + (toPos[0] - fromPos[0]) * t
      const y = fromPos[1] + (toPos[1] - fromPos[1]) * t + Math.sin(t * Math.PI) * 0.5
      const z = fromPos[2] + (toPos[2] - fromPos[2]) * t
      points.push(new THREE.Vector3(x, y, z))
    }
    curveRef.current = new THREE.CatmullRomCurve3(points)
  }, [fromPos, toPos])

  const radius = Math.min(amount / 3, 0.3)
  const particleCount = Math.min(Math.ceil(amount), 6)

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    
    // Animate particles
    particlesRef.current.forEach((particle, i) => {
      if (particle && curveRef.current) {
        const progress = ((elapsed * 0.5 + i * 0.15) % 1)
        const point = curveRef.current.getPoint(progress)
        particle.position.copy(point)
        particle.scale.setScalar(0.25 + Math.sin(elapsed * 5 + i) * 0.1)
      }
    })

    // Pulse the tube
    if (tubeRef.current && tubeRef.current.material) {
      tubeRef.current.material.opacity = 0.7 + Math.sin(elapsed * 3) * 0.2
    }
  })

  return (
    <group>
      {/* Thick tube for energy flow */}
      {curveRef.current && (
        <>
          <mesh ref={tubeRef}>
            <tubeGeometry args={[curveRef.current, 20, radius, 8, false]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Glow effect */}
          <mesh>
            <tubeGeometry args={[curveRef.current, 20, radius * 1.5, 8, false]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.3}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Animated particles */}
          {Array.from({ length: particleCount }).map((_, i) => (
            <mesh
              key={i}
              ref={(ref) => { if (ref) particlesRef.current[i] = ref }}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial
                color="#60a5fa"
                emissive="#60a5fa"
                emissiveIntensity={1.5}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
})

EnergyFlowBeam.displayName = 'EnergyFlowBeam'

// City Ground
const CityGround = React.memo(() => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial
        color="#0f172a"
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
    <gridHelper args={[50, 50, '#1e293b', '#334155']} position={[0, 0, 0]} />
  </>
))
CityGround.displayName = 'CityGround'

export default function OptimizedCity3DMap({ agents, energyFlows, onHouseClick, selectedHouseId }) {
  const [gridSize] = useState([10, 5])
  
  // Memoize positions
  const positions = useMemo(() => {
    const pos = []
    const spacing = 4
    const startX = -(gridSize[0] * spacing) / 2
    const startZ = -(gridSize[1] * spacing) / 2
    
    for (let i = 0; i < 50; i++) {
      const row = Math.floor(i / gridSize[0])
      const col = i % gridSize[0]
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

  // Memoize flow data and create set of active house IDs
  const { flowBeams, activeHouseIds } = useMemo(() => {
    if (!energyFlows || energyFlows.length === 0) {
      return { flowBeams: [], activeHouseIds: new Set() }
    }
    
    const beams = []
    const activeIds = new Set()
    
    energyFlows.forEach((flow, idx) => {
      const fromAgent = agents.find(a => a.id === flow.from)
      const toAgent = agents.find(a => a.id === flow.to)
      if (!fromAgent || !toAgent) return
      
      const fromIdx = flow.from
      const toIdx = flow.to
      if (fromIdx >= positions.length || toIdx >= positions.length) return
      
      const fromPos = [...positions[fromIdx]]
      fromPos[1] = 1.5
      const toPos = [...positions[toIdx]]
      toPos[1] = 1.5
      
      activeIds.add(fromIdx)
      activeIds.add(toIdx)
      
      beams.push({
        id: idx,
        fromPos,
        toPos,
        amount: flow.amount || 0,
      })
    })
    
    return { flowBeams: beams, activeHouseIds: activeIds }
  }, [energyFlows, agents, positions])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-[700px] rounded-2xl overflow-hidden glass border border-white/20 relative"
    >
      <Canvas
        shadows
        camera={{ position: [25, 20, 25], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        performance={{ min: 0.5 }}
        dpr={[1, 1.5]}
      >
        <PerspectiveCamera makeDefault position={[25, 20, 25]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={15}
          maxDistance={60}
          target={[0, 0, 0]}
          dampingFactor={0.05}
        />
        
        {/* Optimized Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <pointLight position={[0, 15, 0]} intensity={0.4} color="#fbbf24" />
        <pointLight position={[-15, 10, -15]} intensity={0.2} color="#3b82f6" />
        <pointLight position={[15, 10, 15]} intensity={0.2} color="#8b5cf6" />
        
        <Environment preset="night" />
        
        <CityGround />
        
        {/* Houses - Only render visible ones */}
        {positions.map((pos, idx) => (
          <CityHouse
            key={idx}
            position={pos}
            agent={agents.find(a => a.id === idx)}
            index={idx}
            onClick={onHouseClick}
            isSelected={selectedHouseId === idx}
            hasActiveFlow={activeHouseIds.has(idx)}
          />
        ))}
        
        {/* Energy Flow Beams */}
        {flowBeams.map((flow) => (
          <EnergyFlowBeam
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
          <span className="font-bold text-blue-400">{energyFlows?.length || 0}</span> active energy flows
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {agents.length} houses • {activeHouseIds.size} active
        </div>
      </div>
    </motion.div>
  )
}
