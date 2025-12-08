import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getStatus,
  startSimulation,
  stopSimulation,
  getAgents,
  getCommunityMetrics,
  getForecast,
  connectWS
} from './api'

// Enhanced Components
import EnhancedHeader from './components/EnhancedHeader'
import ModernNavigation from './components/ModernNavigation'
import EnhancedCommunityMap from './components/EnhancedCommunityMap'
import City3DMap from './components/OptimizedCity3DMap'
import HouseDetailsPanel from './components/HouseDetailsPanel'
import EnergyFlowMonitor from './components/EnergyFlowMonitor'
import AdvancedMetrics from './components/AdvancedMetrics'
import EnhancedForecast from './components/EnhancedForecast'
import PredictiveInsights from './components/PredictiveInsights'
import EnhancedPredictiveInsights from './components/EnhancedPredictiveInsights'
import EnhancedScenarioSimulator from './components/EnhancedScenarioSimulator'
import MetricCard from './components/MetricCard'
import GamificationPanel from './components/GamificationPanel'
import RealTimeEnergyFlow from './components/RealTimeEnergyFlow'
import GlassCard from './components/GlassCard'
import ThemeToggle from './components/ThemeToggle'
import ForecastingPage from './components/ForecastingPage'
import SimulationPage from './components/SimulationPage'
import AnalyticsPage from './components/AnalyticsPage'

// Existing components (keeping for compatibility)
import SwarmMonitor from './components/SwarmMonitor'
import AnomalyDetection from './components/AnomalyDetection'
import ScenarioSimulator from './components/ScenarioSimulator'
import HouseDetails from './components/HouseDetails'
import HistoricalAnalytics from './components/HistoricalAnalytics'
import AIDecisionFlow from './components/AIDecisionFlow'
import AILearningProgress from './components/AILearningProgress'
import AgentNetwork from './components/AgentNetwork'
import PredictionVsActual from './components/PredictionVsActual'
import EnhancedStatistics from './components/EnhancedStatistics'

export default function App() {
  const [status, setStatus] = useState(null)
  const [agents, setAgents] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [energyFlows, setEnergyFlows] = useState([])
  const [agentDecisions, setAgentDecisions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // WebSocket connection for real-time updates
  useEffect(() => {
    let ws
    try {
      ws = connectWS((data) => {
        if (data.houses) {
          setAgents(data.houses.map(h => ({
            id: h.id,
            production: h.production || 0,
            consumption: h.consumption || 0,
            battery_level: h.battery || 0,
            battery_capacity: h.battery_capacity || 10,
            status: h.status || 'balanced'
          })))
        }
        if (data.energy_flows) {
          setEnergyFlows(data.energy_flows.map(f => ({
            from: f.from,
            to: f.to,
            amount: f.amount || 0
          })))
        }
        if (data.metrics) {
          setMetrics({
            solar_utilization_pct: data.metrics.solarUsage || 0,
            self_sufficiency_pct: data.metrics.batteryLevel || 0,
            cost_savings_daily: data.metrics.costSavings || 0,
            co2_avoided_kg: data.metrics.co2Saved || 0,
            energy_shared_kwh: data.metrics.totalShared || 0,
            grid_dependency_pct: 100 - (data.metrics.solarUsage || 0)
          })
        }
        if (data.agentMessages || data.agent_decisions) {
          setAgentDecisions(data.agentMessages || data.agent_decisions || [])
        }
        if (data.hour !== undefined) {
          setStatus(prev => ({
            ...prev,
            current_hour: data.hour,
            status: 'running'
          }))
        }
      })
    } catch (error) {
      console.warn('WebSocket connection failed:', error)
    }

    return () => {
      if (ws) ws.close()
    }
  }, [])

  // Initial data load
  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 5000)
    return () => clearInterval(interval)
  }, [])

  const refreshData = async () => {
    try {
      const [statusData, agentsData, metricsData, forecastData] = await Promise.all([
        getStatus().catch(() => null),
        getAgents().catch(() => []),
        getCommunityMetrics().catch(() => null),
        getForecast().catch(() => null)
      ])

      if (statusData) setStatus(statusData)
      if (agentsData && Array.isArray(agentsData)) setAgents(agentsData)
      if (metricsData) setMetrics(metricsData)
      if (forecastData) setForecast(forecastData.forecast || forecastData)
      setError(null)
    } catch (e) {
      console.error('Data load error:', e)
      if (status || agents.length > 0) {
        setError('Failed to load data. Is the backend running?')
      }
    }
  }

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      await startSimulation(50, 24)
      await refreshData()
    } catch (e) {
      setError('Failed to start simulation: ' + (e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    setError(null)
    try {
      await stopSimulation()
      await refreshData()
    } catch (e) {
      setError('Failed to stop simulation: ' + (e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  const handleHouseClick = (houseId) => {
    const house = agents.find(a => a.id === houseId)
    setSelectedHouse(house)
  }

  return (
    <div className="min-h-screen bg-gradient-premium text-white relative overflow-hidden">
      {/* Premium animated background elements - warm tones */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Ambient warm glow - left */}
        <motion.div
          className="absolute top-20 left-20 w-[500px] h-[500px] bg-energy-solar/8 rounded-full blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Ambient sage glow - right */}
        <motion.div
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-energy-sage/8 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Accent warm glow - center */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-peach/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <EnhancedHeader
        status={status}
        onStart={handleStart}
        onStop={handleStop}
        onRefresh={refreshData}
        loading={loading}
      />

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-6 mt-4 glass border border-red-500/50 rounded-lg p-4 text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <ModernNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6"
            >
              {/* Main Layout: Performance Overview + Scenario Simulator */}
              <div className="grid grid-cols-12 gap-6">
                {/* Left Side: Performance Overview & Predictive Insights */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                  {/* 6 Metric Cards - 2 rows of 3 */}
                  <div className="grid grid-cols-3 gap-4">
                    <MetricCard
                      icon="☀️"
                      label="SOLAR UTILIZATION"
                      value={metrics?.solar_utilization_pct || 0}
                      unit="%"
                      trend={23}
                      color="amber"
                      delay={0}
                    />
                    <MetricCard
                      icon="🔋"
                      label="SELF-SUFFICIENCY"
                      value={metrics?.self_sufficiency_pct || 0}
                      unit="%"
                      trend={1.8}
                      color="sage"
                      delay={0.1}
                    />
                    <MetricCard
                      icon="💰"
                      label="COST SAVINGS"
                      value={metrics?.cost_savings_daily || 0}
                      unit=" TND"
                      trend={6.2}
                      color="gold"
                      delay={0.2}
                    />
                    <MetricCard
                      icon="🌱"
                      label="CO₂ AVOIDED"
                      value={metrics?.co2_avoided_kg || 0}
                      unit=" kg"
                      trend={3.1}
                      color="mint"
                      delay={0.3}
                    />
                    <MetricCard
                      icon="💎"
                      label="ENERGY SHARED"
                      value={metrics?.energy_shared_kwh || 0}
                      unit=" kWh"
                      trend={4.5}
                      color="gold"
                      delay={0.4}
                    />
                    <MetricCard
                      icon="⚡"
                      label="GRID DEPENDENCY"
                      value={metrics?.grid_dependency_pct || 0}
                      unit="%"
                      trend={-2.1}
                      color="coral"
                      delay={0.5}
                    />
                  </div>

                  {/* Predictive Insights */}
                  <EnhancedPredictiveInsights metrics={metrics} forecast={forecast} />
                </div>

                {/* Right Side: Scenario Simulator */}
                <div className="col-span-12 lg:col-span-5">
                  <EnhancedScenarioSimulator onScenarioRun={refreshData} />
                </div>
              </div>

              {/* 3D City Map - Full Width Below */}
              <GlassCard hover={false} className="p-0 overflow-hidden border border-white/10 hover:border-energy-solar/20 transition-all duration-500">
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-energy-solar/5 to-transparent">
                  <h2 className="text-xl font-display font-bold gradient-text">
                    🌍 3D City Energy Network
                  </h2>
                  <div className="text-xs font-medium text-neutral-ash uppercase tracking-wider px-3 py-1.5 glass rounded-full border border-white/10">
                    Click houses to view details
                  </div>
                </div>
                <City3DMap
                  agents={agents}
                  energyFlows={energyFlows}
                  onHouseClick={handleHouseClick}
                  selectedHouseId={selectedHouse?.id}
                />
              </GlassCard>

              {/* Bottom Row: Additional Monitoring */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EnergyFlowMonitor energyFlows={energyFlows} agents={agents} />
                <GlassCard>
                  <h3 className="text-lg font-display font-semibold mb-4 gradient-text">Agent Status</h3>
                  <SwarmMonitor agents={agents} />
                </GlassCard>
                <EnhancedForecast forecast={forecast} />
              </div>
            </motion.div>
          )}

          {activeTab === 'simulation' && (
            <SimulationPage
              agents={agents}
              status={status}
              onStart={handleStart}
              onStop={handleStop}
              onPause={handleStop}
            />
          )}

          {activeTab === 'forecasting' && (
            <ForecastingPage forecast={forecast?.forecast || forecast || []} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage metrics={metrics} />
          )}

          {activeTab === 'intelligence' && (
            <motion.div
              key="intelligence"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-6"
            >
              <GlassCard className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
                <h2 className="text-3xl font-bold text-white mb-2">
                  🤖 AI-Powered Solar Swarm Intelligence
                </h2>
                <p className="text-slate-300">
                  Real-time reinforcement learning agents optimizing energy distribution
                </p>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AIDecisionFlow agentDecisions={agentDecisions} agents={agents} />
                <AILearningProgress agents={agents} />
                <PredictionVsActual forecast={forecast?.forecast || []} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AgentNetwork agents={agents} energyFlows={energyFlows} />
                <EnhancedStatistics metrics={metrics} />
              </div>

              <RealTimeEnergyFlow energyFlows={energyFlows} agents={agents} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* House Details Panel (Side Panel) */}
      <HouseDetailsPanel
        house={selectedHouse}
        onClose={() => setSelectedHouse(null)}
        isVisible={!!selectedHouse}
      />

      {/* Theme Toggle (Floating) */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeToggle />
      </div>
    </div>
  )
}