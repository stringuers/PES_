import React, { useState } from 'react'
import AnomalyHeatmap from './AnomalyHeatmap'

export default function AnomalyDetection({ agents = [] }) {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      house: 34,
      title: 'Low Production',
      expected: 4.2,
      actual: 2.1,
      cause: 'Panel soiling',
      action: 'Schedule cleaning',
      resolved: false,
      time: '14:15'
    },
    {
      id: 2,
      type: 'resolved',
      house: 12,
      title: 'Resolved',
      message: 'Shading issue cleared at 13:45',
      resolved: true,
      time: '13:45'
    }
  ])

  const handleDismiss = (id) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        🚨 ANOMALY DETECTION
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">System Health:</span>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm font-semibold">
            🟢 OPTIMAL
          </span>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-300 mb-2">Recent Alerts:</div>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg p-3 ${
                  alert.resolved
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{alert.resolved ? '✅' : '⚠️'}</span>
                    <span className="font-semibold text-sm text-white">
                      House #{alert.house} - {alert.title}
                    </span>
                  </div>
                  {!alert.resolved && (
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
                {!alert.resolved ? (
                  <>
                    <div className="text-xs text-slate-300 mb-1">
                      Expected: {alert.expected} kWh | Actual: {alert.actual} kWh
                    </div>
                    <div className="text-xs text-slate-400 mb-1">
                      Likely cause: {alert.cause}
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      Action: {alert.action}
                    </div>
                    <button className="text-xs text-blue-400 hover:text-blue-300">
                      View Details
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-slate-300">{alert.message}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-300 mb-2">📊 Detection Accuracy:</div>
          <div className="space-y-1 text-xs text-slate-400">
            <div>True positives: 23</div>
            <div>False positives: 2</div>
            <div className="text-green-400 font-semibold">Precision: 92%</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-300 mb-2">Predicted Issues (Next 24h):</div>
          <div className="text-xs text-slate-400">• None detected</div>
        </div>
        
        {/* Anomaly Heatmap */}
        {agents.length > 0 && (
          <div className="pt-4 border-t border-slate-700">
            <AnomalyHeatmap agents={agents} />
          </div>
        )}
      </div>
    </div>
  )
}

