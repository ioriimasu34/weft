'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  factory_id: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // In a real app, this would check for a valid JWT token
        const token = localStorage.getItem('auth_token')
        if (token) {
          // Validate token with backend
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            setIsAuthenticated(true)
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('auth_token')
            setIsAuthenticated(false)
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const { user: userData, token } = await response.json()
        localStorage.setItem('auth_token', token)
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.message }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  const register = async (userData: {
    first_name: string
    last_name: string
    email: string
    password: string
    role: string
    factory_id: string
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const { user: newUser, token } = await response.json()
        localStorage.setItem('auth_token', token)
        setUser(newUser)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.message }
      }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: 'Network error' }
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register
  }
}