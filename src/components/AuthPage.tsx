'use client'

import React, { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { CheckSquare, Users, Shield, Clock } from 'lucide-react'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 rounded-xl p-3">
              <CheckSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">TaskMaster</h1>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Manage Your Tasks with Intelligence
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            A modern, secure, and intelligent task management application with 
            advanced auto-logout features for enhanced security.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">User Authentication</h3>
                <p className="text-gray-600">Secure JWT-based authentication with customizable session management.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Task Management</h3>
                <p className="text-gray-600">Create, update, and delete tasks with an intuitive interface.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Auto-Logout Security</h3>
                <p className="text-gray-600">Configurable inactivity detection with smart warning system.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-orange-100 rounded-lg p-2">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Enhanced Security</h3>
                <p className="text-gray-600">Advanced session management with customizable preferences.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-blue-600 rounded-xl p-3">
                <CheckSquare className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">TaskMaster</h1>
            </div>
            <p className="text-gray-600">
              Intelligent task management with enhanced security
            </p>
          </div>

          {/* Auth Forms */}
          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}

          {/* Demo Info */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Demo Information</h4>
            <p className="text-sm text-yellow-700 mb-2">
              This application uses DummyJSON for backend APIs. For demo purposes:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Use demo credentials: <code className="bg-yellow-100 px-1 rounded">emilys / emilyspass</code></li>
              <li>• Signup creates a demo account with those credentials</li>
              <li>• Tasks are simulated using the DummyJSON todos API</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
