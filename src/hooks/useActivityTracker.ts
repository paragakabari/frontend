'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface UseActivityTrackerOptions {
  onWarning: () => void
  onLogout: () => void
}

export function useActivityTracker({ onWarning, onLogout }: UseActivityTrackerOptions) {
  const { preferences, isAuthenticated } = useAuth()
  const { activityConfig } = preferences
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const warningTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastActivityRef = useRef<number>(Date.now())
  const isWarningActiveRef = useRef<boolean>(false)

  const clearTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }
  }, [])

  const resetTimer = useCallback(() => {
    if (!isAuthenticated || !activityConfig.enabled) return

    clearTimers()
    lastActivityRef.current = Date.now()
    isWarningActiveRef.current = false

    // Set inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      if (isAuthenticated) {
        isWarningActiveRef.current = true
        onWarning()
        
        // Set warning timer for auto-logout
        warningTimerRef.current = setTimeout(() => {
          if (isWarningActiveRef.current) {
            onLogout()
          }
        }, activityConfig.warningTime * 1000)
      }
    }, activityConfig.inactivityTimeout * 60 * 1000)
  }, [isAuthenticated, activityConfig, onWarning, onLogout, clearTimers])

  const handleActivity = useCallback(() => {
    if (!isAuthenticated || !activityConfig.enabled) return
    
    // If warning is active and user interacts, reset everything
    if (isWarningActiveRef.current) {
      isWarningActiveRef.current = false
      clearTimers()
    }
    
    resetTimer()
  }, [isAuthenticated, activityConfig.enabled, resetTimer, clearTimers])

  const forceLogout = useCallback(() => {
    clearTimers()
    onLogout()
  }, [clearTimers, onLogout])

  const stayLoggedIn = useCallback(() => {
    isWarningActiveRef.current = false
    clearTimers()
    resetTimer()
  }, [clearTimers, resetTimer])

  // Set up event listeners
  useEffect(() => {
    if (!isAuthenticated || !activityConfig.enabled) {
      clearTimers()
      return
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ]

    const throttledHandleActivity = throttle(handleActivity, 1000)

    events.forEach(event => {
      document.addEventListener(event, throttledHandleActivity, true)
    })

    // Initial timer setup
    resetTimer()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, throttledHandleActivity, true)
      })
      clearTimers()
    }
  }, [isAuthenticated, activityConfig.enabled, handleActivity, resetTimer, clearTimers])

  return {
    forceLogout,
    stayLoggedIn,
    isWarningActive: isWarningActiveRef.current
  }
}

// Throttle function to limit how often we reset the timer
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }) as T
}
