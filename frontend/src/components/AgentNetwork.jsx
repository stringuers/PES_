import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AgentNetwork({ agents = [], energyFlows = [] }) {
  // Build network graph data
  const networkData = useMemo(() => {
    const nodes = agents.map(agent => ({
      id: agent.id,
      label: `House ${agent.id}`,
      group: agent.status === 'surplus' ? 1 : agent.status === 'deficit' ? 2 : 3,
      value: (agent.production || 0) + (agent.battery_level || 0),
      status: agent.status
    }))
    
    const links = energyFlows.map(flow => ({
      source: flow.from,
      target: flow.to,
      value: flow.amount || 0,
      type: 'energy_flow'
    }))
    
    // Add neighbor connections
    agents.forEach(agent => {
      if (agent.neighbors && agent.neighbors.length > 0) {
        agent.neighbors.forEach(neighborId => {
          if (!links.find(l => l.source === agent.id && l.target === neighborId)) {
            links.push({
              source: agent.id,
              target: neighborId,
              value: 0.1, // Connection strength
              type: 'neighbor'
            })
          }
        })
      }
    })
    
    return { nodes, links }
  }, [agents, energyFlows])
  
  // Communication statistics
  const commStats = useMemo(() => {
    const totalConnections = networkData.links.length
    const activeFlows = networkData.links.filter(l => l.type === 'energy_flow' && l.value > 0).length
    const avgFlowAmount = networkData.links
      .filter(l => l.type === 'energy_flow')
      .reduce((sum, l) => sum + l.value, 0) / activeFlows || 0
    
    return {
      totalConnections,
      activeFlows,
      avgFlowAmount,
      networkDensity: (totalConnections / (agents.length * (agents.length - 1))) * 100 || 0
    }
  }, [networkData, agents.length])
  
  // Network activity over time (simulated)
  const activityData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      messages: Math.floor(Math.random() * 50) + 20,
      transfers: Math.floor(Math.random() * 15) + 5,
      efficiency: 70 + Math.random() * 20
    }))
  }, [])
  
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🌐 AGENT COMMUNICATION NETWORK
      </h2>
      
      <div className="space-y-4">
        {/* Network Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-xs text-slate-400">Total Connections</div>
            <div className="text-xl font-bold text-blue-400">{commStats.totalConnections}</div>
          </div>
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-xs text-slate-400">Active Flows</div>
            <div className="text-xl font-bold text-green-400">{commStats.activeFlows}</div>
          </div>
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-xs text-slate-400">Avg Flow (kWh)</div>
            <div className="text-xl font-bold text-yellow-400">{commStats.avgFlowAmount.toFixed(2)}</div>
          </div>
          <div className="bg-slate-700/50 rounded p-2">
            <div className="text-xs text-slate-400">Network Density</div>
            <div className="text-xl font-bold text-purple-400">{commStats.networkDensity.toFixed(1)}%</div>
          </div>
        </div>
        
        {/* Network Visualization (Simplified) */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Network Topology:</div>
          <div className="bg-slate-900 rounded p-4 h-48 relative overflow-hidden">
            {/* Simple network visualization */}
            <svg width="100%" height="100%" viewBox="0 0 400 200" className="absolute inset-0">
              {/* Draw connections */}
              {networkData.links.slice(0, 30).map((link, idx) => {
                const sourceNode = networkData.nodes.find(n => n.id === link.source)
                const targetNode = networkData.nodes.find(n => n.id === link.target)
                if (!sourceNode || !targetNode) return null
                
                const x1 = ((sourceNode.id % 10) / 10) * 400
                const y1 = (Math.floor(sourceNode.id / 10) / 5) * 200
                const x2 = ((targetNode.id % 10) / 10) * 400
                const y2 = (Math.floor(targetNode.id / 10) / 5) * 200
                
                return (
                  <line
                    key={idx}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={link.type === 'energy_flow' ? '#60a5fa' : '#475569'}
                    strokeWidth={link.type === 'energy_flow' ? 2 : 1}
                    opacity={link.type === 'energy_flow' ? 0.6 : 0.3}
                  />
                )
              })}
              
              {/* Draw nodes */}
              {networkData.nodes.slice(0, 50).map((node) => {
                const x = ((node.id % 10) / 10) * 400
                const y = (Math.floor(node.id / 10) / 5) * 200
                const color = node.status === 'surplus' ? '#10b981' : node.status === 'deficit' ? '#ef4444' : '#fbbf24'
                
                return (
                  <circle
                    key={node.id}
                    cx={x}
                    cy={y}
                    r={4}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                )
              })}
            </svg>
            <div className="absolute bottom-2 left-2 text-xs text-slate-500">
              Showing {Math.min(networkData.nodes.length, 50)} of {networkData.nodes.length} agents
            </div>
          </div>
        </div>
        
        {/* Network Activity */}
        <div>
          <div className="text-sm text-slate-400 mb-2">Network Activity (24h):</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '6px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="transfers" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* AI Communication Protocol */}
        <div className="pt-2 border-t border-slate-700">
          <div className="text-sm font-semibold text-slate-300 mb-2">AI Communication Protocol:</div>
          <div className="space-y-1 text-xs text-slate-400">
            <div>• Agents broadcast status every 5 seconds</div>
            <div>• Negotiation protocol: Request → Offer → Accept/Reject</div>
            <div>• Energy routing uses Dijkstra's algorithm</div>
            <div>• Consensus mechanism for conflict resolution</div>
          </div>
        </div>
      </div>
    </div>
  )
}

