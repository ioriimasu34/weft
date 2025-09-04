'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useAuth } from './use-auth'

interface RealtimeMessage {
  type: string
  payload: any
  timestamp: string
  org_id: string
}

interface RealtimeState {
  connected: boolean
  lastMessage: RealtimeMessage | null
  error: string | null
  messageCount: number
}

export function useRealtime() {
  const [state, setState] = useState<RealtimeState>({
    connected: false,
    lastMessage: null,
    error: null,
    messageCount: 0,
  })
  
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(async () => {
    if (!user) return

    try {
      // Get user's organization
      const { data: membership } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        setState(prev => ({ ...prev, error: 'No organization found' }))
        return
      }

      const orgId = membership.org_id

      // Disconnect existing channel
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current)
      }

      // Create new channel
      const channel = supabase
        .channel(`org:${orgId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'events',
            filter: `org_id=eq.${orgId}`,
          },
          (payload) => {
            console.log('Real-time event received:', payload)
            
            const message: RealtimeMessage = {
              type: payload.new.type,
              payload: payload.new.payload,
              timestamp: payload.new.created_at,
              org_id: payload.new.org_id,
            }

            setState(prev => ({
              ...prev,
              lastMessage: message,
              messageCount: prev.messageCount + 1,
              connected: true,
              error: null,
            }))
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'readers',
            filter: `org_id=eq.${orgId}`,
          },
          (payload) => {
            console.log('Reader status update:', payload)
            
            const message: RealtimeMessage = {
              type: 'reader.status',
              payload: payload.new,
              timestamp: payload.new.updated_at,
              org_id: payload.new.org_id,
            }

            setState(prev => ({
              ...prev,
              lastMessage: message,
              messageCount: prev.messageCount + 1,
              connected: true,
              error: null,
            }))
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
          
          if (status === 'SUBSCRIBED') {
            setState(prev => ({ ...prev, connected: true, error: null }))
          } else if (status === 'CHANNEL_ERROR') {
            setState(prev => ({ ...prev, connected: false, error: 'Channel error' }))
          } else if (status === 'TIMED_OUT') {
            setState(prev => ({ ...prev, connected: false, error: 'Connection timed out' }))
          } else if (status === 'CLOSED') {
            setState(prev => ({ ...prev, connected: false }))
          }
        })

      channelRef.current = channel

    } catch (error) {
      console.error('Error connecting to realtime:', error)
      setState(prev => ({ 
        ...prev, 
        connected: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      }))
    }
  }, [user, supabase])

  const disconnect = useCallback(async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    setState(prev => ({ ...prev, connected: false }))
  }, [supabase])

  const reconnect = useCallback(() => {
    disconnect()
    
    // Reconnect after a delay
    reconnectTimeoutRef.current = setTimeout(() => {
      connect()
    }, 5000)
  }, [connect, disconnect])

  // Connect on mount and when user changes
  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [user, connect, disconnect])

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!state.connected && user && !state.error) {
      const timeout = setTimeout(() => {
        reconnect()
      }, 10000) // Reconnect after 10 seconds

      return () => clearTimeout(timeout)
    }
  }, [state.connected, state.error, user, reconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connected: state.connected,
    lastMessage: state.lastMessage,
    error: state.error,
    messageCount: state.messageCount,
    connect,
    disconnect,
    reconnect,
  }
}