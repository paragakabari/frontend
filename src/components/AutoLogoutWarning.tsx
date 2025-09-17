'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { AlertTriangle } from 'lucide-react'

interface AutoLogoutWarningProps {
  isOpen: boolean
  warningTime: number // in seconds
  onStayLoggedIn: () => void
  onLogout: () => void
}

export function AutoLogoutWarning({ 
  isOpen, 
  warningTime, 
  onStayLoggedIn, 
  onLogout 
}: AutoLogoutWarningProps) {
  const [countdown, setCountdown] = useState(warningTime)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(warningTime)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, warningTime])

  // Handle logout when countdown reaches 0
  useEffect(() => {
    if (isOpen && countdown === 0) {
      onLogout()
    }
  }, [isOpen, countdown, onLogout])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">Session Timeout Warning</DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            You will be automatically logged out due to inactivity.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {formatTime(countdown)}
            </div>
            <p className="text-sm text-gray-500">
              Time remaining before automatic logout
            </p>
          </div>
          
          <p className="text-sm text-gray-600">
            Click "Stay Logged In" to continue your session or "Logout" to logout immediately.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Logout
          </Button>
          <Button
            onClick={onStayLoggedIn}
            className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
