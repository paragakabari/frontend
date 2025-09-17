'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AuthPage } from '@/components/AuthPage'
import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TaskMaster...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {isAuthenticated ? <Dashboard /> : <AuthPage />}
    </>
  )
}