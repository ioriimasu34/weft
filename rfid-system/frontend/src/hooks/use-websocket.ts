'use client'

import { useState, useEffect, useRef } from 'react'

interface WebSocketMessage {
  type: 'scan_event' | 'system_status' | 'alert' | 'heartbeat'
  payload: any
  timestamp: string
}

export function useWebSocket(url: string = 'ws://localhost:8001/ws') {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setError(null)
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          
          // Handle different message types
          switch (message.type) {
            case 'scan_event':
              // Handle new RFID scan
              console.log('New scan event:', message.payload)
              break
            case 'system_status':
              // Handle system status update
              console.log('System status update:', message.payload)
              break
            case 'alert':
              // Handle alerts
              console.log('Alert received:', message.payload)
              break
            case 'heartbeat':
              // Handle heartbeat
              break
            default:
              console.log('Unknown message type:', message.type)
          }
        } catch (parseError) {
          console.error('Failed to parse WebSocket message:', parseError)
        }
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        console.log('WebSocket disconnected:', event.code, event.reason)
        
        // Attempt to reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...')
          connect()
        }, 5000)
      }

      ws.onerror = (event) => {
        setError('WebSocket error occurred')
        console.error('WebSocket error:', event)
      }
    } catch (error) {
      setError('Failed to create WebSocket connection')
      console.error('WebSocket connection failed:', error)
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
  }

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }

  // Subscribe to specific RFID reader events
  const subscribeToReader = (readerId: string) => {
    const message: WebSocketMessage = {
      type: 'scan_event',
      payload: { action: 'subscribe', reader_id: readerId },
      timestamp: new Date().toISOString()
    }
    return sendMessage(message)
  }

  // Unsubscribe from specific RFID reader events
  const unsubscribeFromReader = (readerId: string) => {
    const message: WebSocketMessage = {
      type: 'scan_event',
      payload: { action: 'unsubscribe', reader_id: readerId },
      timestamp: new Date().toISOString()
    }
    return sendMessage(message)
  }

  // Request system status update
  const requestSystemStatus = () => {
    const message: WebSocketMessage = {
      type: 'system_status',
      payload: { action: 'request_update' },
      timestamp: new Date().toISOString()
    }
    return sendMessage(message)
  }

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [url])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    isConnected,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    subscribeToReader,
    unsubscribeFromReader,
    requestSystemStatus
  }
}