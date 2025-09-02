'use client'

import { 
  HomeIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  WifiIcon
} from '@heroicons/react/24/outline'

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigationItems = [
  {
    id: 'overview',
    name: 'Overview',
    icon: HomeIcon,
    description: 'Dashboard overview'
  },
  {
    id: 'production',
    name: 'Production',
    icon: CogIcon,
    description: 'Production line tracking'
  },
  {
    id: 'uniforms',
    name: 'Uniforms',
    icon: UserGroupIcon,
    description: 'Uniform management'
  },
  {
    id: 'scans',
    name: 'Real-time Scans',
    icon: WifiIcon,
    description: 'Live RFID scan feed'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: ChartBarIcon,
    description: 'Reports & insights'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: DocumentTextIcon,
    description: 'System configuration'
  }
]

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className={`font-medium ${
                      isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Factory Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Factory Status
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Lines Active:</span>
              <span className="font-medium text-green-600">3/3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Tags in Use:</span>
              <span className="font-medium text-blue-600">342/450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className="font-medium text-green-600">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}