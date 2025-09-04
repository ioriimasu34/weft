'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon,
  HomeIcon,
  BoltIcon,
  TagIcon,
  CpuChipIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  WifiIcon,
  WifiSlashIcon,
} from '@heroicons/react/24/outline'

type TabType = 'overview' | 'real-time' | 'assets' | 'readers' | 'analytics' | 'settings'

interface DashboardSidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  isOpen: boolean
  onClose: () => void
  realtimeConnected: boolean
}

const navigation = [
  { name: 'Overview', tab: 'overview' as TabType, icon: HomeIcon },
  { name: 'Real-time', tab: 'real-time' as TabType, icon: BoltIcon },
  { name: 'Assets', tab: 'assets' as TabType, icon: TagIcon },
  { name: 'Readers', tab: 'readers' as TabType, icon: CpuChipIcon },
  { name: 'Analytics', tab: 'analytics' as TabType, icon: ChartBarIcon },
  { name: 'Settings', tab: 'settings' as TabType, icon: Cog6ToothIcon },
]

export function DashboardSidebar({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  onClose, 
  realtimeConnected 
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      RFID Platform
                    </h2>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <button
                                onClick={() => {
                                  onTabChange(item.tab)
                                  onClose()
                                }}
                                className={`${
                                  activeTab === item.tab
                                    ? 'bg-gray-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left`}
                              >
                                <item.icon
                                  className={`${
                                    activeTab === item.tab ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                  } h-6 w-6 shrink-0`}
                                />
                                {item.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                      
                      {/* System status */}
                      <li className="mt-auto">
                        <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                          <div className={`h-2 w-2 rounded-full ${
                            realtimeConnected ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          <div className="flex items-center gap-x-2">
                            {realtimeConnected ? (
                              <WifiIcon className="h-4 w-4 text-green-400" />
                            ) : (
                              <WifiSlashIcon className="h-4 w-4 text-red-400" />
                            )}
                            <span className={realtimeConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {realtimeConnected ? 'Connected' : 'Disconnected'}
                            </span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              RFID Platform
            </h2>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => onTabChange(item.tab)}
                        className={`${
                          activeTab === item.tab
                            ? 'bg-gray-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full text-left`}
                      >
                        <item.icon
                          className={`${
                            activeTab === item.tab ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          } h-6 w-6 shrink-0`}
                        />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              
              {/* System status */}
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                  <div className={`h-2 w-2 rounded-full ${
                    realtimeConnected ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <div className="flex items-center gap-x-2">
                    {realtimeConnected ? (
                      <WifiIcon className="h-4 w-4 text-green-400" />
                    ) : (
                      <WifiSlashIcon className="h-4 w-4 text-red-400" />
                    )}
                    <span className={realtimeConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {realtimeConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}