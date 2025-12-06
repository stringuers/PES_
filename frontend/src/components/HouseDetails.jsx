import React from 'react'

export default function HouseDetails({ house, onClose }) {
  if (!house) return null

  const {
    id,
    battery_level = 8.5,
    battery_capacity = 10,
    production = 4.8,
    consumption = 2.3,
    status = 'surplus'
  } = house

  const batteryPercent = (battery_level / battery_capacity) * 100
  const netAvailable = production - consumption

  // Mock data for today's activity
  const todayStats = {
    generated: 32.4,
    consumed: 18.7,
    shared: 8.2,
    sharedHomes: 3,
    received: 1.5,
    receivedHomes: 1,
    gridImport: 0
  }

  const costSavings = {
    today: 8.40,
    month: 247
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🏠 HOUSE #{id} DETAILS
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Current Status:</div>
            <div className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
              status === 'surplus' ? 'bg-green-500/20 text-green-400' :
              status === 'deficit' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {status === 'surplus' ? '🟢 Generating' : status === 'deficit' ? '🔴 Needs Energy' : '🟡 Balanced'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-400">Solar Production</div>
              <div className="text-lg font-bold text-white">{production.toFixed(1)} kWh</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Consumption</div>
              <div className="text-lg font-bold text-white">{consumption.toFixed(1)} kWh</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Net Available</div>
              <div className="text-lg font-bold text-green-400">{netAvailable.toFixed(1)} kWh</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Battery Level</div>
              <div className="text-lg font-bold text-blue-400">{batteryPercent.toFixed(0)}%</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700">
            <div className="text-sm font-semibold text-slate-300 mb-2">Today's Activity:</div>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>• Generated:</span>
                <span className="text-white">{todayStats.generated} kWh</span>
              </div>
              <div className="flex justify-between">
                <span>• Consumed:</span>
                <span className="text-white">{todayStats.consumed} kWh</span>
              </div>
              <div className="flex justify-between">
                <span>• Shared:</span>
                <span className="text-white">{todayStats.shared} kWh ({todayStats.sharedHomes} homes)</span>
              </div>
              <div className="flex justify-between">
                <span>• Received:</span>
                <span className="text-white">{todayStats.received} kWh ({todayStats.receivedHomes} home)</span>
              </div>
              <div className="flex justify-between">
                <span>• Grid import:</span>
                <span className="text-white">{todayStats.gridImport} kWh</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700">
            <div className="text-sm font-semibold text-slate-300 mb-2">AI Agent Status:</div>
            <div className="space-y-1 text-xs text-slate-400">
              <div>• Mode: Sharing</div>
              <div>• Neighbors: 6 connected</div>
              <div>• Learning rate: Optimal</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700">
            <div className="text-sm font-semibold text-slate-300 mb-2">Cost Savings:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">• Today:</span>
                <span className="text-green-400 font-semibold">${costSavings.today} saved</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">• This month:</span>
                <span className="text-green-400 font-semibold">${costSavings.month} saved</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors">
              View 24h History
            </button>
            <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white transition-colors">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

