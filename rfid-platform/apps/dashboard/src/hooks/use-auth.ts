'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error initializing auth:', error)
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false 
        }))
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        })

        if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
        } else if (event === 'SIGNED_IN') {
          router.push('/')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, router])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }))
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      toast.success('Signed in successfully')
      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [supabase.auth])

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }))
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      if (data.user && !data.session) {
        toast.success('Please check your email to confirm your account')
      } else {
        toast.success('Account created successfully')
      }
      
      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [supabase.auth])

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }))
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      toast.success('Signed out successfully')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [supabase.auth])

  const resetPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }))
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      toast.success('Password reset email sent')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [supabase.auth])

  const updateProfile = useCallback(async (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await supabase.auth.updateUser({
        data: updates,
      })

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }))
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, error: errorMessage, loading: false }))
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [supabase.auth])

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  }
}