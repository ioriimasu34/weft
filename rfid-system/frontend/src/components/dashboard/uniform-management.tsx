'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface Uniform {
  id: string
  tag_id: string
  employee_id: string
  employee_name: string
  uniform_type: string
  size: string
  issue_date: string
  return_date: string | null
  status: 'issued' | 'returned' | 'overdue' | 'lost'
  last_seen: string
  location: string
}

interface UniformManagementProps {}

export function UniformManagement({}: UniformManagementProps) {
  const [uniforms, setUniforms] = useState<Uniform[]>([
    {
      id: '1',
      tag_id: 'UNI-001-ABC123',
      employee_id: 'EMP-001',
      employee_name: 'Ahmed Khan',
      uniform_type: 'Work Shirt',
      size: 'L',
      issue_date: '2024-01-15',
      return_date: null,
      status: 'issued',
      last_seen: '2 hours ago',
      location: 'Production Line A'
    },
    {
      id: '2',
      tag_id: 'UNI-002-DEF456',
      employee_id: 'EMP-002',
      employee_name: 'Fatima Rahman',
      uniform_type: 'Work Pants',
      size: 'M',
      issue_date: '2024-01-10',
      return_date: '2024-01-20',
      status: 'returned',
      last_seen: '1 day ago',
      location: 'Laundry Room'
    },
    {
      id: '3',
      tag_id: 'UNI-003-GHI789',
      employee_id: 'EMP-003',
      employee_name: 'Mohammed Ali',
      uniform_type: 'Safety Vest',
      size: 'XL',
      issue_date: '2024-01-05',
      return_date: null,
      status: 'overdue',
      last_seen: '3 days ago',
      location: 'Unknown'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showIssueForm, setShowIssueForm] = useState(false)

  const filteredUniforms = uniforms.filter(uniform => {
    const matchesSearch = uniform.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uniform.tag_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || uniform.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'returned':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'overdue':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued':
        return <CheckCircleIcon className="w-4 h-4 text-blue-600" />
      case 'returned':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />
      case 'overdue':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
      case 'lost':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />
    }
  }

  const stats = {
    total: uniforms.length,
    issued: uniforms.filter(u => u.status === 'issued').length,
    returned: uniforms.filter(u => u.status === 'returned').length,
    overdue: uniforms.filter(u => u.status === 'overdue').length,
    lost: uniforms.filter(u => u.status === 'lost').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Uniform Management
            </h2>
          </div>
          <button
            onClick={() => setShowIssueForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Issue Uniform</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total}
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">Total Uniforms</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.issued}
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">Currently Issued</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.returned}
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">Returned</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.overdue}
            </div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">Overdue</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.lost}
            </div>
            <div className="text-sm text-red-800 dark:text-red-200">Lost</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name or tag ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Uniforms List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Uniforms ({filteredUniforms.length})
          </h3>
          
          <div className="space-y-4">
            {filteredUniforms.map((uniform) => (
              <div
                key={uniform.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {uniform.tag_id}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(uniform.status)}`}>
                        {uniform.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Employee:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {uniform.employee_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {uniform.uniform_type}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Size:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {uniform.size}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Issue Date:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {uniform.issue_date}
                        </p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Last Seen:</span>
                          <p className="text-gray-900 dark:text-white">
                            {uniform.last_seen}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Location:</span>
                          <p className="text-gray-900 dark:text-white">
                            {uniform.location}
                          </p>
                        </div>
                        {uniform.return_date && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Return Date:</span>
                            <p className="text-gray-900 dark:text-white">
                              {uniform.return_date}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div className="ml-4">
                    {getStatusIcon(uniform.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUniforms.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No uniforms found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}