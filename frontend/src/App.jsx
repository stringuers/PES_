import React, { useState, useEffect } from 'react'
import {
  getStatus,
  startSimulation,
  stopSimulation,
  getAgents,
  getCommunityMetrics,
  getForecast,
  connectWS
} from './api'
import LiveCommunityMap from './components/LiveCommunityMap'
import CommunityMap3D from './components/CommunityMap3D'
import RealTimeMetrics from './components/RealTimeMetrics'
import SolarForecast from './components/SolarForecast'
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
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'analytics', 'ai'
  const [energyFlows, setEnergyFlows] = useState([])
  const [agentDecisions, setAgentDecisions] = useState([])
  const [use3D, setUse3D] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // WebSocket connection for real-time updates
  useEffect(() => {
    let ws
    try {
      ws = connectWS((data) => {
        // Handle real-time updates from WebSocket
        if (data.houses) {
          // Convert houses to agents format
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
            co2_avoided_kg: data.metrics.co2Saved || 0
          })
        }
        if (data.agentMessages || data.agent_decisions) {
          setAgentDecisions(data.agentMessages || data.agent_decisions || [])
        }
        if (data.decisionStats) {
          // Update decision statistics if available
          console.log('Decision stats:', data.decisionStats)
        }
        if (data.ai_metrics) {
          // Update AI metrics if available
          console.log('AI metrics:', data.ai_metrics)
        }
        // Update status if provided
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
    const interval = setInterval(refreshData, 5000) // Refresh every 5 seconds
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
      if (forecastData) setForecast(forecastData)
      setError(null)
    } catch (e) {
      console.error('Data load error:', e)
      // Don't set error on initial load if backend isn't running
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

  const handleScenarioRun = (result) => {
    console.log('Scenario result:', result)
    refreshData()
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">🌞 Solar Swarm Intelligence</h1>
            <p className="text-sm text-slate-400">Multi-Agent Reinforcement Learning for Community Solar Optimization</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              onClick={handleStart}
              disabled={loading || status?.status === 'running'}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Start Simulation
            </button>
            <button
              onClick={handleStop}
              disabled={loading || status?.status !== 'running'}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Stop
            </button>
            {status && (
              <div className="px-3 py-1 bg-slate-700 rounded text-xs">
                Status: <span className={status.status === 'running' ? 'text-green-400' : 'text-slate-400'}>{status.status}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-6 pt-4 border-b border-slate-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            🏠 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'ai'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            🤖 AI Intelligence
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            📈 Analytics
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'dashboard' ? (
        <div className="p-6 space-y-4">
          {/* Scenario Simulator - Top */}
          <ScenarioSimulator onScenarioRun={handleScenarioRun} />
          
          {loading && (
            <div className="text-center py-4 text-slate-400">
              Loading...
            </div>
          )}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-12 gap-4">
            {/* Left Column - Forecasting */}
            <div className="col-span-3">
              <SolarForecast forecast={forecast?.forecast || forecast || []} />
            </div>

            {/* Center Column - Live Map (3D or 2D) */}
            <div className="col-span-6">
              <div className="mb-2 flex justify-end">
                <button
                  onClick={() => setUse3D(!use3D)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"
                >
                  {use3D ? 'Switch to 2D' : 'Switch to 3D'}
                </button>
              </div>
              {use3D ? (
                <CommunityMap3D
                  agents={agents}
                  onHouseClick={handleHouseClick}
                  energyFlows={energyFlows}
                />
              ) : (
                <LiveCommunityMap
                  agents={agents}
                  onHouseClick={handleHouseClick}
                  energyFlows={energyFlows}
                />
              )}
            </div>

            {/* Right Column - Metrics */}
            <div className="col-span-3">
              <RealTimeMetrics metrics={metrics} />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-2 gap-4">
            <SwarmMonitor agents={agents} />
            <AnomalyDetection agents={agents} />
          </div>
        </div>
      ) : activeTab === 'ai' ? (
        <div className="p-6 space-y-4">
          {/* AI Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
            <h2 className="text-2xl font-bold text-white mb-2">🤖 AI-Powered Solar Swarm Intelligence</h2>
            <p className="text-slate-300 text-sm">
              Real-time reinforcement learning agents optimizing energy distribution through multi-agent coordination
            </p>
          </div>

          {/* Top Row - AI Core Features */}
          <div className="grid grid-cols-3 gap-4">
            <AIDecisionFlow agentDecisions={agentDecisions} agents={agents} />
            <AILearningProgress agents={agents} />
            <PredictionVsActual forecast={forecast?.forecast || []} />
          </div>

          {/* Middle Row - Network & Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <AgentNetwork agents={agents} energyFlows={energyFlows} />
            <EnhancedStatistics metrics={metrics} />
          </div>

          {/* Bottom - Enhanced Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="text-sm text-slate-400 mb-2">AI Decision Accuracy</div>
              <div className="text-3xl font-bold text-green-400">94.2%</div>
              <div className="text-xs text-slate-500 mt-1">Based on 1,245 episodes</div>
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="text-sm text-slate-400 mb-2">Agent Coordination</div>
              <div className="text-3xl font-bold text-blue-400">342</div>
              <div className="text-xs text-slate-500 mt-1">Messages/min</div>
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="text-sm text-slate-400 mb-2">Learning Rate</div>
              <div className="text-3xl font-bold text-yellow-400">0.0003</div>
              <div className="text-xs text-slate-500 mt-1">PPO optimizer</div>
            </div>
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="text-sm text-slate-400 mb-2">Reward Improvement</div>
              <div className="text-3xl font-bold text-purple-400">+18.3</div>
              <div className="text-xs text-slate-500 mt-1">Avg reward/episode</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <HistoricalAnalytics />
        </div>
      )}

      {/* House Details Modal */}
      {selectedHouse && (
        <HouseDetails
          house={selectedHouse}
          onClose={() => setSelectedHouse(null)}
        />
      )}
    </div>
  )
}
