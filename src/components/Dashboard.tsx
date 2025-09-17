'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useActivityTracker } from '@/hooks/useActivityTracker'
import { Header } from '@/components/layout/Header'
import { TodoList } from '@/components/todos/TodoList'
import { PreferencesSettings } from '@/components/settings/PreferencesSettings'
import { AutoLogoutWarning } from '@/components/AutoLogoutWarning'

export function Dashboard() {
  const { logout, preferences } = useAuth()
  const [currentView, setCurrentView] = useState<'todos' | 'settings'>('todos')
  const [showLogoutWarning, setShowLogoutWarning] = useState(false)

  const { forceLogout, stayLoggedIn } = useActivityTracker({
    onWarning: () => setShowLogoutWarning(true),
    onLogout: () => {
      setShowLogoutWarning(false)
      logout()
    }
  })

  const handleStayLoggedIn = () => {
    setShowLogoutWarning(false)
    stayLoggedIn()
  }

  const handleForceLogout = () => {
    setShowLogoutWarning(false)
    forceLogout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <Header 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />

        <main>
          {currentView === 'todos' && <TodoList />}
          {currentView === 'settings' && <PreferencesSettings />}
        </main>

        {/* Auto-logout Warning Dialog */}
        <AutoLogoutWarning
          isOpen={showLogoutWarning}
          warningTime={preferences.activityConfig.warningTime}
          onStayLoggedIn={handleStayLoggedIn}
          onLogout={handleForceLogout}
        />
      </div>
    </div>
  )
}
