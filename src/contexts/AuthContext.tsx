'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { authAPI } from '@/services/api'
import { User, LoginCredentials, SignupCredentials, UserPreferences } from '@/types'
import { isTokenExpired } from '@/lib/utils'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  preferences: UserPreferences
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'LOGOUT' }

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  preferences: {
    staySignedIn: false,
    activityConfig: {
      inactivityTimeout: 10, // 10 minutes
      warningTime: 60, // 60 seconds
      enabled: true
    }
  }
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload }
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      dispatch({ type: 'SET_PREFERENCES', payload: JSON.parse(savedPreferences) })
    }
  }, [])

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token')
      
      if (!token || isTokenExpired(token)) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        const userData = await authAPI.getCurrentUser()
        dispatch({ type: 'SET_USER', payload: userData })
        dispatch({ type: 'SET_AUTHENTICATED', payload: true })
      } catch (error) {
        console.error('Auth check failed:', error)
        logout()
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await authAPI.login(credentials)
      
      // Set cookies
      const expiresIn = state.preferences.staySignedIn ? 7 : undefined // 7 days or session
      Cookies.set('token', response.token, { expires: expiresIn })
      Cookies.set('refreshToken', response.refreshToken, { expires: expiresIn })
      
      dispatch({ type: 'SET_USER', payload: response })
      dispatch({ type: 'SET_AUTHENTICATED', payload: true })
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await authAPI.signup(credentials)
      
      // Set cookies
      const expiresIn = state.preferences.staySignedIn ? 7 : undefined
      Cookies.set('token', response.token, { expires: expiresIn })
      Cookies.set('refreshToken', response.refreshToken, { expires: expiresIn })
      
      dispatch({ type: 'SET_USER', payload: response })
      dispatch({ type: 'SET_AUTHENTICATED', payload: true })
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const logout = () => {
    Cookies.remove('token')
    Cookies.remove('refreshToken')
    dispatch({ type: 'LOGOUT' })
  }

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...state.preferences, ...newPreferences }
    dispatch({ type: 'SET_PREFERENCES', payload: updatedPreferences })
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences))
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        updatePreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
