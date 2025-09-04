import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface RFIDRead {
  id: string
  epc: string
  reader_id: string
  antenna: number
  rssi: number
  read_at: string
  location?: string
}

interface RFIDContextType {
  reads: RFIDRead[]
  isScanning: boolean
  startScanning: () => void
  stopScanning: () => void
  simulateRead: () => void
  clearReads: () => void
}

const RFIDContext = createContext<RFIDContextType | undefined>(undefined)

export function RFIDProvider({ children }: { children: ReactNode }) {
  const [reads, setReads] = useState<RFIDRead[]>([])
  const [isScanning, setIsScanning] = useState(false)

  // Simulate RFID reads for demo purposes
  const simulateRead = () => {
    const newRead: RFIDRead = {
      id: Math.random().toString(36).substr(2, 9),
      epc: `E200001234567890${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      reader_id: `reader-${Math.floor(Math.random() * 3) + 1}`,
      antenna: Math.floor(Math.random() * 4) + 1,
      rssi: Math.floor(Math.random() * 30) - 80,
      read_at: new Date().toISOString(),
      location: ['Cut Station', 'Sew Station', 'Finish Station'][Math.floor(Math.random() * 3)]
    }
    
    setReads(prev => [newRead, ...prev.slice(0, 99)]) // Keep last 100 reads
  }

  const startScanning = () => {
    setIsScanning(true)
    // Simulate continuous scanning
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of read per interval
        simulateRead()
      }
    }, 1000)
    
    // Store interval ID for cleanup
    ;(window as any).rfidInterval = interval
  }

  const stopScanning = () => {
    setIsScanning(false)
    if ((window as any).rfidInterval) {
      clearInterval((window as any).rfidInterval)
      ;(window as any).rfidInterval = null
    }
  }

  const clearReads = () => {
    setReads([])
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ((window as any).rfidInterval) {
        clearInterval((window as any).rfidInterval)
      }
    }
  }, [])

  const value = {
    reads,
    isScanning,
    startScanning,
    stopScanning,
    simulateRead,
    clearReads,
  }

  return (
    <RFIDContext.Provider value={value}>
      {children}
    </RFIDContext.Provider>
  )
}

export function useRFID() {
  const context = useContext(RFIDContext)
  if (context === undefined) {
    throw new Error('useRFID must be used within an RFIDProvider')
  }
  return context
}
