'use client'

import React, { useState } from 'react'
import { Todo } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Check, X, Edit2, Trash2, Save } from 'lucide-react'

interface TodoItemProps {
  todo: Todo
  onUpdate: (id: string, updates: { todo?: string; completed?: boolean }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isOwner: boolean
  isSelected?: boolean
  onSelect?: (id: string) => void
}

export function TodoItem({ todo, onUpdate, onDelete, isOwner, isSelected = false, onSelect }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.todo)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleComplete = async () => {
    if (!isOwner) return
    
    setIsLoading(true)
    try {
      await onUpdate(todo.id, { completed: !todo.completed })
    } catch (error) {
      console.error('Failed to update todo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    const trimmedText = editText.trim()
    
    // Validation: Check if text is empty
    if (!trimmedText) {
      alert('Task cannot be empty!')
      return
    }
    
    // Check if no changes were made
    if (trimmedText === todo.todo) {
      setIsEditing(false)
      return
    }

    setIsLoading(true)
    try {
      await onUpdate(todo.id, { todo: trimmedText })
      setIsEditing(false)
      console.log('Task updated successfully')
    } catch (error) {
      console.error('Failed to update todo:', error)
      setEditText(todo.todo) // Reset on error
      alert('Failed to update task. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditText(todo.todo)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    // Enhanced confirmation with task preview
    const confirmMessage = `Are you sure you want to delete this task?\n\n"${todo.todo.length > 50 ? todo.todo.substring(0, 50) + '...' : todo.todo}"\n\nThis action cannot be undone.`
    if (!confirm(confirmMessage)) return
    
    setIsLoading(true)
    try {
      await onDelete(todo.id)
      // Optional: Show success message
      console.log('Task deleted successfully')
    } catch (error) {
      console.error('Failed to delete todo:', error)
      // Show user-friendly error message
      alert('Failed to delete task. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <Card className={`transition-all duration-200 ${todo.completed ? 'opacity-75' : ''} ${isLoading ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Selection checkbox for bulk operations */}
          {isOwner && onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(todo.id)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          )}

          {/* Completion Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={!isOwner || isLoading}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
              ${todo.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 hover:border-green-400'
              }
              ${!isOwner ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            {todo.completed && <Check className="w-3 h-3" />}
          </button>

          {/* Todo Text */}
          <div className="flex-grow">
            {isEditing ? (
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-base "
                autoFocus
                disabled={isLoading}
              />
            ) : (
              <span 
                className={`text-base ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900 break-all'}`}
              >
                {todo.todo}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {isOwner && (
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    disabled={isLoading || !editText.trim()}
                    className="p-1 h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="p-1 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                    className="p-1 h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Todo metadata */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>ID: {todo.id}</span>
          <span>User: {todo.userId}</span>
        </div>
      </CardContent>
    </Card>
  )
}
