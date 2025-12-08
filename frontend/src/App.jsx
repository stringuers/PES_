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
import City3DMap from './components/City3DMap'
import HouseDetailsPanel from './components/HouseDetailsPanel'
import AdvancedMetrics from './components/AdvancedMetrics'
import EnhancedForecast from './components/EnhancedForecast'
import PredictiveInsights from './components/PredictiveInsights'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
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
              {/* Top Row: Forecast & Quick Stats */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-4">
                  <EnhancedForecast forecast={forecast} />
                </div>
                <div className="col-span-12 md:col-span-8">
                  <AdvancedMetrics metrics={metrics} forecast={forecast} />
                </div>
              </div>

              {/* Main Visualization */}
              <GlassCard className="p-0 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold gradient-text">
                      🌍 Community Energy Network
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-slate-400">Surplus</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-slate-400">Balanced</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-slate-400">Deficit</span>
                      </div>
                    </div>
                  </div>
                </div>
                <City3DMap
                  agents={agents}
                  energyFlows={energyFlows}
                  onHouseClick={handleHouseClick}
                  selectedHouseId={selectedHouse?.id}
                />
              </GlassCard>

              {/* Predictive Insights */}
              <PredictiveInsights metrics={metrics} forecast={forecast} />

              {/* Bottom Row: Monitoring & Scenarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard>
                  <SwarmMonitor agents={agents} />
                </GlassCard>
                <GlassCard>
                  <ScenarioSimulator onScenarioRun={refreshData} />
                </GlassCard>
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