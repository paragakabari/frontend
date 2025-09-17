'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

interface TodoFormProps {
  onCreateTodo: (todoText: string) => Promise<void>
  isLoading?: boolean
}

export function TodoForm({ onCreateTodo, isLoading = false }: TodoFormProps) {
  const [todoText, setTodoText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!todoText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onCreateTodo(todoText.trim())
      setTodoText('') // Clear form on success
    } catch (error) {
      console.error('Failed to create todo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const loading = isLoading || isSubmitting

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Task
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="todoText" className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <Input
              id="todoText"
              type="text"
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What needs to be done?"
              className="w-full"
              disabled={loading}
              maxLength={200}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {todoText.length}/200 characters
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading || !todoText.trim()}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Task...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
