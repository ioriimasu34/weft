import React from 'react'
import { motion } from 'framer-motion'
import { Scan, Square, Trash2, Tag } from 'lucide-react'
import { useRFID } from '../contexts/RFIDContext'

const Scanner = () => {
  const { reads, isScanning, startScanning, stopScanning, simulateRead, clearReads } = useRFID()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">RFID Scanner</h1>
        <p className="mt-1 text-sm text-gray-500">
          Scan RFID tags and view real-time results
        </p>
      </div>

      {/* Scanner Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Scanner Controls</h2>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isScanning 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isScanning ? 'Scanning' : 'Idle'}
          </div>
        </div>
        
        <div className="flex space-x-3">
          {!isScanning ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startScanning}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <Scan className="h-5 w-5" />
              <span>Start Scanning</span>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={stopScanning}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Square className="h-5 w-5" />
              <span>Stop Scanning</span>
            </motion.button>
          )}
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={simulateRead}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Tag className="h-5 w-5" />
            <span>Simulate</span>
          </motion.button>
        </div>
      </div>

      {/* Live Feed */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Live Feed</h2>
          <button
            onClick={clearReads}
            className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
        
        {reads.length === 0 ? (
          <div className="text-center py-8">
            <Scan className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reads yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start scanning or simulate a read to see results.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {reads.map((read, index) => (
              <motion.div
                key={read.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {read.epc}
                    </p>
                    <p className="text-xs text-gray-500">
                      Reader: {read.reader_id} • Ant: {read.antenna} • RSSI: {read.rssi} dBm
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

      {/* Statistics */}
      {reads.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{reads.length}</p>
              <p className="text-sm text-gray-500">Total Reads</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {new Set(reads.map(r => r.epc)).size}
              </p>
              <p className="text-sm text-gray-500">Unique Tags</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Scanner
