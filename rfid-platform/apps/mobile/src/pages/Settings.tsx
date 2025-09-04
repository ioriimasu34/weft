import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Wifi, Download, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Settings = () => {
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState(true)
  const [autoSync, setAutoSync] = useState(true)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and app preferences
        </p>
      </div>

      {/* User Profile */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-lg font-medium text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {user?.full_name || 'User'}
            </h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <User className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* App Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">App Settings</h2>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500">Get notified about new RFID reads</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wifi className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Auto Sync</p>
                <p className="text-xs text-gray-500">Automatically sync data when online</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
        
        <div className="card">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Export Data</p>
                <p className="text-xs text-gray-500">Download RFID reads as CSV</p>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>
        </div>

        <div className="card">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <Upload className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Import Data</p>
                <p className="text-xs text-gray-500">Upload RFID data from file</p>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        
        <div className="card">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Change Password</p>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="card">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Sign Out
        </motion.button>
      </div>
    </div>
  )
}

export default Settings
