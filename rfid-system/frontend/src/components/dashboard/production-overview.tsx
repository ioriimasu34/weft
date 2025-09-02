'use client'

import { useState, useEffect } from 'react'
import { 
  CogIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

interface ProductionLine {
  id: string
  name: string
  current_capacity: number
  max_capacity: number
  status: 'active' | 'warning' | 'error' | 'inactive'
  efficiency: number
  tags_in_production: number
  last_scan: string
}

interface ProductionOverviewProps {
  detailed?: boolean
}

export function ProductionOverview({ detailed = false }: ProductionOverviewProps) {
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([
    {
      id: 'line-1',
      name: 'Line A',
      current_capacity: 142,
      max_capacity: 150,
      status: 'active',
      efficiency: 94.7,
      tags_in_production: 142,
      last_scan: '2 minutes ago'
    },
    {
      id: 'line-2',
      name: 'Line B',
      current_capacity: 138,
      max_capacity: 150,
      status: 'active',
      efficiency: 92.0,
      tags_in_production: 138,
      last_scan: '1 minute ago'
    },
    {
      id: 'line-3',
      name: 'Line C',
      current_capacity: 62,
      max_capacity: 150,
      status: 'active',
      efficiency: 41.3,
      tags_in_production: 62,
      last_scan: '5 minutes ago'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      case 'inactive':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      case 'inactive':
        return <ClockIcon className="w-5 h-5 text-gray-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getCapacityPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100)
  }

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Production Overview
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              All systems operational
            </span>
          </div>
        </div>

        {/* Production Lines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productionLines.map((line) => (
            <div
              key={line.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              {/* Line Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CogIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {line.name}
                  </h3>
                </div>
                {getStatusIcon(line.status)}
              </div>

              {/* Capacity Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {line.current_capacity}/{line.max_capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getCapacityColor(
                      getCapacityPercentage(line.current_capacity, line.max_capacity)
                    )}`}
                    style={{
                      width: `${getCapacityPercentage(line.current_capacity, line.max_capacity)}%`
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getCapacityPercentage(line.current_capacity, line.max_capacity)}% utilized
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {line.efficiency}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">In Production:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {line.tags_in_production}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Last Scan:</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {line.last_scan}
                  </span>
                </div>
              </div>

              {/* Warning for high capacity */}
              {getCapacityPercentage(line.current_capacity, line.max_capacity) >= 90 && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs text-yellow-800 dark:text-yellow-200">
                      High capacity - monitor for bottlenecks
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {productionLines.reduce((sum, line) => sum + line.current_capacity, 0)}
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              Total Tags in Production
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(
                productionLines.reduce((sum, line) => sum + line.efficiency, 0) / productionLines.length
              )}%
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">
              Average Efficiency
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {productionLines.filter(line => line.status === 'active').length}
            </div>
            <div className="text-sm text-purple-800 dark:text-purple-200">
              Active Lines
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {productionLines.reduce((sum, line) => sum + line.max_capacity, 0)}
            </div>
            <div className="text-sm text-orange-800 dark:text-orange-200">
              Total Capacity
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}