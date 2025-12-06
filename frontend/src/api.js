const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function getStatus() {
  const res = await fetch(`${API_BASE}/api/v1/simulation/status`)
  if (!res.ok) throw new Error(`Status failed: ${res.status}`)
  return res.json()
}

export async function startSimulation(numAgents = 50, hours = 24) {
  const res = await fetch(`${API_BASE}/api/v1/simulation/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ num_agents: numAgents, hours })
  })
  if (!res.ok) throw new Error(`Start failed: ${res.status}`)
  return res.json()
}

export async function stopSimulation() {
  const res = await fetch(`${API_BASE}/api/v1/simulation/stop`, { method: 'POST' })
  if (!res.ok) throw new Error(`Stop failed: ${res.status}`)
  return res.json()
}

export async function getAgents() {
  const res = await fetch(`${API_BASE}/api/v1/agents`)
  if (!res.ok) throw new Error(`Agents failed: ${res.status}`)
  return res.json()
}

export async function getAgent(agentId) {
  const res = await fetch(`${API_BASE}/api/v1/agents/${agentId}`)
  if (!res.ok) throw new Error(`Agent failed: ${res.status}`)
  return res.json()
}

export async function getCommunityMetrics() {
  const res = await fetch(`${API_BASE}/api/v1/metrics/community`)
  if (!res.ok) throw new Error(`Metrics failed: ${res.status}`)
  return res.json()
}

export async function getForecast() {
  const res = await fetch(`${API_BASE}/api/v1/forecast/24h`)
  if (!res.ok) throw new Error(`Forecast failed: ${res.status}`)
  return res.json()
}

export async function runScenario(scenarioType, parameters = null) {
  const res = await fetch(`${API_BASE}/api/v1/scenario/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_type: scenarioType, parameters })
  })
  if (!res.ok) throw new Error(`Scenario failed: ${res.status}`)
  return res.json()
}

export async function getMetricsHistory(hours = 24) {
  const res = await fetch(`${API_BASE}/api/v1/metrics/history?hours=${hours}`)
  if (!res.ok) throw new Error(`History failed: ${res.status}`)
  return res.json()
}

export function connectWS(onMessage) {
  const base = API_BASE.replace('http://', 'ws://').replace('https://', 'wss://')
  const url = (import.meta.env.VITE_WS_URL) || `${base}/ws/simulation`
  const ws = new WebSocket(url)
  ws.onmessage = (e) => {
    try { onMessage(JSON.parse(e.data)) } catch { /* ignore */ }
  }
  ws.onerror = (e) => console.error('WebSocket error:', e)
  ws.onopen = () => console.log('WebSocket connected')
  ws.onclose = () => console.log('WebSocket disconnected')
  return ws
}
