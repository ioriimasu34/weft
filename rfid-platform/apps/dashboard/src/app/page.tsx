'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { OverviewTab } from '@/components/dashboard/overview'
import { RealTimeTab } from '@/components/dashboard/real-time'
import { AssetsTab } from '@/components/dashboard/assets'
import { ReadersTab } from '@/components/dashboard/readers'
import { AnalyticsTab } from '@/components/dashboard/analytics'
import { SettingsTab } from '@/components/dashboard/settings'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ErrorBoundary } from '@/components/ui/error-boundary'

type TabType = 'overview' | 'real-time' | 'assets' | 'readers' | 'analytics' | 'settings'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const { connected, lastMessage } = useRealtime()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Handle real-time messages
  useEffect(() => {
    if (lastMessage) {
      console.log('Real-time message received:', lastMessage)
      // Handle different message types
      switch (lastMessage.type) {
        case 'rfid.read':
          // Update real-time feed
          break
        case 'reader.status':
          // Update reader status
          break
        case 'system.alert':
          // Show system alert
          break
      }
    }
  }, [lastMessage])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'real-time':
        return <RealTimeTab />
      case 'assets':
        return <AssetsTab />
      case 'readers':
        return <ReadersTab />
      case 'analytics':
        return <AnalyticsTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <DashboardHeader
          user={user}
          onSignOut={signOut}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          realtimeConnected={connected}
        />

        <div className="flex">
          {/* Sidebar */}
          <DashboardSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            realtimeConnected={connected}
          />

          {/* Main Content */}
          <main className="flex-1 lg:ml-64">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              <ErrorBoundary>
                {renderTabContent()}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}