import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Tag, Wifi, Clock } from 'lucide-react'
import { useRFID } from '../contexts/RFIDContext'

const Dashboard = () => {
  const { reads, isScanning } = useRFID()

  const stats = [
    {
      name: 'Total Reads',
      value: reads.length,
      icon: Tag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Readers',
      value: new Set(reads.map(r => r.reader_id)).size,
      icon: Wifi,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Last Read',
      value: reads.length > 0 ? 'Just now' : 'None',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Status',
      value: isScanning ? 'Scanning' : 'Idle',
      icon: Activity,
      color: isScanning ? 'text-green-600' : 'text-gray-600',
      bgColor: isScanning ? 'bg-green-100' : 'bg-gray-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">RFID Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Real-time RFID tracking and monitoring
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Reads */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reads</h2>
          <span className="text-sm text-gray-500">{reads.length} total</span>
        </div>
        
        {reads.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reads yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start scanning to see RFID reads appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reads.slice(0, 10).map((read, index) => (
              <motion.div
                key={read.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {read.epc}
                    </p>
                    <p className="text-xs text-gray-500">
                      {read.reader_id} • Antenna {read.antenna} • {read.rssi} dBm
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(read.read_at).toLocaleTimeString()}
                  </p>
                  {read.location && (
                    <p className="text-xs text-blue-600 font-medium">
                      {read.location}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
