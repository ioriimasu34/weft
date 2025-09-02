'use client'

import { useState, useEffect } from 'react'
import { 
  WifiIcon, 
  ClockIcon,
  MapPinIcon,
  UserIcon,
  TagIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface ScanEvent {
  id: string
  tag_id: string
  checkpoint_name: string
  production_line: string
  operator_name: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
  rssi: number
  phase: number
}

interface RealTimeScansProps {
  detailed?: boolean
}

export function RealTimeScans({ detailed = false }: RealTimeScansProps) {
  const [scanEvents, setScanEvents] = useState<ScanEvent[]>([
    {
      id: '1',
      tag_id: 'TAG-001-ABC123',
      checkpoint_name: 'Cut Station',
      production_line: 'Line A',
      operator_name: 'Ahmed Khan',
      timestamp: '2 minutes ago',
      status: 'success',
      rssi: -45,
      phase: 180
    },
    {
      id: '2',
      tag_id: 'TAG-002-DEF456',
      checkpoint_name: 'Sewing Station 1',
      production_line: 'Line B',
      operator_name: 'Fatima Rahman',
      timestamp: '3 minutes ago',
      status: 'success',
      rssi: -52,
      phase: 175
    },
    {
      id: '3',
      tag_id: 'TAG-003-GHI789',
      checkpoint_name: 'Quality Check',
      production_line: 'Line A',
      operator_name: 'Mohammed Ali',
      timestamp: '4 minutes ago',
      status: 'warning',
      rssi: -68,
      phase: 160
    },
    {
      id: '4',
      tag_id: 'TAG-004-JKL012',
      checkpoint_name: 'Finishing Station',
      production_line: 'Line C',
      operator_name: 'Aisha Begum',
      timestamp: '5 minutes ago',
      status: 'success',
      rssi: -48,
      phase: 185
    }
  ])

  const [isLive, setIsLive] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Simulate new scan events
      const newEvent: ScanEvent = {
        id: Date.now().toString(),
        tag_id: `TAG-${Math.floor(Math.random() * 999) + 1}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        checkpoint_name: ['Cut Station', 'Sewing Station 1', 'Sewing Station 2', 'Quality Check', 'Finishing Station'][Math.floor(Math.random() * 5)],
        production_line: ['Line A', 'Line B', 'Line C'][Math.floor(Math.random() * 3)],
        operator_name: ['Ahmed Khan', 'Fatima Rahman', 'Mohammed Ali', 'Aisha Begum', 'Rashid Ahmed'][Math.floor(Math.random() * 5)],
        timestamp: 'Just now',
        status: Math.random() > 0.9 ? 'warning' : 'success',
        rssi: Math.floor(Math.random() * 30) - 70,
        phase: Math.floor(Math.random() * 360)
      }

      setScanEvents(prev => [newEvent, ...prev.slice(0, detailed ? 19 : 9)])
    }, 3000) // New scan every 3 seconds

    return () => clearInterval(interval)
  }, [isLive, detailed])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getRssiColor = (rssi: number) => {
    if (rssi >= -50) return 'text-green-600 dark:text-green-400'
    if (rssi >= -60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <WifiIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Real-time Scans
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isLive ? 'Live' : 'Paused'}
            </span>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isLive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
              }`}
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        {/* Scan Events List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {scanEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <TagIcon className="w-4 h-4 text-blue-600" />
                    <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                      {event.tag_id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {event.checkpoint_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CogIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {event.production_line}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {event.operator_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {event.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Technical Details */}
                  {detailed && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          RSSI: <span className={getRssiColor(event.rssi)}>{event.rssi} dBm</span>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          Phase: {event.phase}°
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live indicator for recent scans */}
                {event.timestamp === 'Just now' && (
                  <div className="ml-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full scan-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Showing {scanEvents.length} recent scans
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {scanEvents.filter(e => e.timestamp === 'Just now').length} new in last minute
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}