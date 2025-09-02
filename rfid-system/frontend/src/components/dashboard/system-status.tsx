'use client'

import { useState, useEffect } from 'react'
import { 
  ServerIcon, 
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface SystemComponent {
  id: string
  name: string
  type: 'rfid_reader' | 'database' | 'api' | 'websocket' | 'redis'
  status: 'online' | 'offline' | 'warning' | 'error'
  last_seen: string
  response_time: number
  location: string
  details: string
}

interface SystemStatusProps {}

export function SystemStatus({}: SystemStatusProps) {
  const [systemComponents, setSystemComponents] = useState<SystemComponent[]>([
    {
      id: 'reader-1',
      name: 'Impinj Speedway R420',
      type: 'rfid_reader',
      status: 'online',
      last_seen: 'Just now',
      response_time: 45,
      location: 'Production Line A',
      details: 'Reading 142 tags, RSSI: -45dBm'
    },
    {
      id: 'reader-2',
      name: 'Zebra FX9600',
      type: 'rfid_reader',
      status: 'online',
      last_seen: '2 minutes ago',
      response_time: 52,
      location: 'Production Line B',
      details: 'Reading 138 tags, RSSI: -52dBm'
    },
    {
      id: 'reader-3',
      name: 'Impinj Speedway R420',
      type: 'rfid_reader',
      status: 'warning',
      last_seen: '5 minutes ago',
      response_time: 120,
      location: 'Production Line C',
      details: 'Reading 62 tags, RSSI: -68dBm (weak signal)'
    },
    {
      id: 'db-1',
      name: 'Supabase Database',
      type: 'database',
      status: 'online',
      last_seen: 'Just now',
      response_time: 12,
      location: 'Cloud',
      details: 'PostgreSQL 15, 99.9% uptime'
    },
    {
      id: 'api-1',
      name: 'RFID Ingest API',
      type: 'api',
      status: 'online',
      last_seen: 'Just now',
      response_time: 28,
      location: 'Server 1',
      details: 'FastAPI, 0 errors, 1.2k req/min'
    },
    {
      id: 'ws-1',
      name: 'WebSocket Service',
      type: 'websocket',
      status: 'online',
      last_seen: 'Just now',
      response_time: 5,
      location: 'Server 1',
      details: 'Socket.IO, 45 active connections'
    },
    {
      id: 'redis-1',
      name: 'Redis Cache',
      type: 'redis',
      status: 'online',
      last_seen: 'Just now',
      response_time: 3,
      location: 'Server 1',
      details: 'Memory: 45%, Keys: 1.2k'
    }
  ])

  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'outage'>('operational')

  useEffect(() => {
    const onlineCount = systemComponents.filter(c => c.status === 'online').length
    const totalCount = systemComponents.length
    
    if (onlineCount === totalCount) {
      setOverallStatus('operational')
    } else if (onlineCount >= totalCount * 0.8) {
      setOverallStatus('degraded')
    } else {
      setOverallStatus('outage')
    }
  }, [systemComponents])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'offline':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      case 'offline':
        return <ClockIcon className="w-5 h-5 text-gray-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'outage':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getOverallStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />
      case 'degraded':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
      case 'outage':
        return <XCircleIcon className="w-6 h-6 text-red-600" />
      default:
        return <ClockIcon className="w-6 h-6 text-gray-600" />
    }
  }

  const stats = {
    total: systemComponents.length,
    online: systemComponents.filter(c => c.status === 'online').length,
    warning: systemComponents.filter(c => c.status === 'warning').length,
    error: systemComponents.filter(c => c.status === 'error').length,
    offline: systemComponents.filter(c => c.status === 'offline').length
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ServerIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              System Status
            </h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getOverallStatusColor(overallStatus)}`}>
            <div className="flex items-center space-x-2">
              {getOverallStatusIcon(overallStatus)}
              <span className="capitalize">{overallStatus}</span>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">Total Components</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.online}
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">Online</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.warning}
            </div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">Warning</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.error}
            </div>
            <div className="text-sm text-red-800 dark:text-red-200">Error</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.offline}
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200">Offline</div>
          </div>
        </div>

        {/* Component Status List */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Component Status
          </h3>
          
          {systemComponents.map((component) => (
            <div
              key={component.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      {component.type === 'rfid_reader' && <WifiIcon className="w-4 h-4 text-blue-600" />}
                      {component.type === 'database' && <ServerIcon className="w-4 h-4 text-green-600" />}
                      {component.type === 'api' && <ServerIcon className="w-4 h-4 text-purple-600" />}
                      {component.type === 'websocket' && <WifiIcon className="w-4 h-4 text-orange-600" />}
                      {component.type === 'redis' && <ServerIcon className="w-4 h-4 text-red-600" />}
                      
                      <span className="font-medium text-gray-900 dark:text-white">
                        {component.name}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                      {component.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Location:</span>
                      <p className="text-gray-900 dark:text-white">
                        {component.location}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Response Time:</span>
                      <p className="text-gray-900 dark:text-white">
                        {component.response_time}ms
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Last Seen:</span>
                      <p className="text-gray-900 dark:text-white">
                        {component.last_seen}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Type:</span>
                      <p className="text-gray-900 dark:text-white capitalize">
                        {component.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {component.details}
                  </div>
                </div>

                {/* Status Icon */}
                <div className="ml-4">
                  {getStatusIcon(component.status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System Health Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              System Health Summary
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>• Overall uptime: 99.7% (last 30 days)</p>
              <p>• Average response time: 35ms</p>
              <p>• Last incident: 5 days ago (Line C reader signal degradation)</p>
              <p>• Next maintenance: Scheduled for next Sunday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}