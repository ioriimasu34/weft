'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { ProductionOverview } from '@/components/dashboard/production-overview'
import { RealTimeScans } from '@/components/dashboard/real-time-scans'
import { UniformManagement } from '@/components/dashboard/uniform-management'
import { SystemStatus } from '@/components/dashboard/system-status'
import { useWebSocket } from '@/hooks/use-websocket'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { user, isAuthenticated } = useAuth()
  const { isConnected, lastMessage } = useWebSocket()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Handle authentication redirect
      console.log('User not authenticated')
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} />
      
      <div className="flex">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 p-6">
          {/* Connection Status */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ProductionOverview />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RealTimeScans />
                <SystemStatus />
              </div>
            </div>
          )}
          
          {activeTab === 'production' && (
            <div className="space-y-6">
              <ProductionOverview detailed />
            </div>
          )}
          
          {activeTab === 'uniforms' && (
            <UniformManagement />
          )}
          
          {activeTab === 'scans' && (
            <RealTimeScans detailed />
          )}
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              <p className="text-gray-600">Advanced analytics and reporting features coming soon.</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">System Settings</h2>
              <p className="text-gray-600">Configure system parameters and user management.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}