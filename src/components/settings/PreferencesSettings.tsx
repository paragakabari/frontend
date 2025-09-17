'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Settings, Save, Clock, Shield } from 'lucide-react'

export function PreferencesSettings() {
  const { preferences, updatePreferences } = useAuth()
  const [localPreferences, setLocalPreferences] = useState(preferences)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      updatePreferences(localPreferences)
      // Show success message
      setTimeout(() => setIsSaving(false), 500)
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setIsSaving(false)
    }
  }

  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(localPreferences)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          User Preferences
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Auto-logout Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Auto-logout Settings</h3>
          </div>
          
          <div className="space-y-4 pl-7">
            <div className="flex items-center">
              <input
                id="enableAutoLogout"
                type="checkbox"
                checked={localPreferences.activityConfig.enabled}
                onChange={(e) => setLocalPreferences(prev => ({
                  ...prev,
                  activityConfig: {
                    ...prev.activityConfig,
                    enabled: e.target.checked
                  }
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableAutoLogout" className="ml-2 text-sm text-gray-700">
                Enable auto-logout on inactivity
              </label>
            </div>

            {localPreferences.activityConfig.enabled && (
              <>
                <div>
                  <label htmlFor="inactivityTimeout" className="block text-sm font-medium text-gray-700 mb-1">
                    Inactivity Timeout (minutes)
                  </label>
                  <Input
                    id="inactivityTimeout"
                    type="number"
                    min="1"
                    max="240"
                    value={localPreferences.activityConfig.inactivityTimeout}
                    onChange={(e) => setLocalPreferences(prev => ({
                      ...prev,
                      activityConfig: {
                        ...prev.activityConfig,
                        inactivityTimeout: parseInt(e.target.value) || 10
                      }
                    }))}
                    className="w-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Time before showing logout warning (1-240 minutes)
                  </p>
                </div>

                <div>
                  <label htmlFor="warningTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Warning Time (seconds)
                  </label>
                  <Input
                    id="warningTime"
                    type="number"
                    min="10"
                    max="300"
                    value={localPreferences.activityConfig.warningTime}
                    onChange={(e) => setLocalPreferences(prev => ({
                      ...prev,
                      activityConfig: {
                        ...prev.activityConfig,
                        warningTime: parseInt(e.target.value) || 60
                      }
                    }))}
                    className="w-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Countdown time before automatic logout (10-300 seconds)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Authentication Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium text-gray-900">Authentication Settings</h3>
          </div>
          
          <div className="pl-7">
            <div className="flex items-center">
              <input
                id="staySignedIn"
                type="checkbox"
                checked={localPreferences.staySignedIn}
                onChange={(e) => setLocalPreferences(prev => ({
                  ...prev,
                  staySignedIn: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="staySignedIn" className="ml-2 text-sm text-gray-700">
                Stay signed in (remember me for 7 days)
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              When enabled, you'll stay logged in for 7 days instead of 30 minutes
            </p>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Settings Summary:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Auto-logout: {localPreferences.activityConfig.enabled ? 'Enabled' : 'Disabled'}</li>
            {localPreferences.activityConfig.enabled && (
              <>
                <li>• Inactivity timeout: {localPreferences.activityConfig.inactivityTimeout} minutes</li>
                <li>• Warning countdown: {localPreferences.activityConfig.warningTime} seconds</li>
              </>
            )}
            <li>• Stay signed in: {localPreferences.staySignedIn ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
