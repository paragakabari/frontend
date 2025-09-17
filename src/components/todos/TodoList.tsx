'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { todosAPI } from '@/services/api'
import { Todo } from '@/types'
import { TodoItem } from './TodoItem'
import { TodoForm } from './TodoForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckSquare, Square, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react'

export function TodoList() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [selectedTodos, setSelectedTodos] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadTodos()
    }
  }, [user])

  const loadTodos = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Get user's todos first
      const userTodosResponse = await todosAPI.getUserTodos(user.id)
      let allTodos = userTodosResponse.todos

      // If user has few todos, get some general todos too
      if (allTodos.length < 5) {
        const generalTodosResponse = await todosAPI.getAllTodos(10, 0)
        
        // Filter out any todos that already exist in user's todos to prevent duplicates
        const userTodoIds = new Set(allTodos.map(todo => todo.id))
        const uniqueGeneralTodos = generalTodosResponse.todos.filter(
          todo => !userTodoIds.has(todo.id)
        )
        
        allTodos = [...allTodos, ...uniqueGeneralTodos]
      }

      setTodos(allTodos)
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTodo = async (todoText: string) => {
    if (!user) return

    try {
      const newTodo = await todosAPI.createTodo({
        todo: todoText,
        completed: false,
        userId: user.id
      })
      setTodos(prev => [newTodo, ...prev])
    } catch (error) {
      console.error('Failed to create todo:', error)
      throw error
    }
  }

  const handleUpdateTodo = async (id: string, updates: { todo?: string; completed?: boolean }) => {
    try {
      const updatedTodo = await todosAPI.updateTodo(id, updates)
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, ...updatedTodo } : todo
      ))
      
      // Optional: Show success feedback for status changes
      if (updates.completed !== undefined) {
        console.log(`Task marked as ${updates.completed ? 'completed' : 'pending'}`)
      }
    } catch (error) {
      console.error('Failed to update todo:', error)
      
      // More specific error handling
      const err = error as any
      if (err.response?.status === 404) {
        alert('Task not found. It may have been deleted by another user.')
        // Remove from local state if not found
        setTodos(prev => prev.filter(todo => todo.id !== id))
      } else if (err.response?.status === 403) {
        alert('You do not have permission to edit this task.')
      } else {
        throw error // Re-throw for component to handle
      }
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await todosAPI.deleteTodo(id)
      setTodos(prev => prev.filter(todo => todo.id !== id))
      console.log('Task deleted successfully')
    } catch (error) {
      console.error('Failed to delete todo:', error)
      
      // More specific error handling
      const err = error as any
      if (err.response?.status === 404) {
        alert('Task not found. It may have already been deleted.')
        // Remove from local state anyway
        setTodos(prev => prev.filter(todo => todo.id !== id))
      } else if (err.response?.status === 403) {
        alert('You do not have permission to delete this task.')
      } else {
        throw error // Re-throw for component to handle
      }
    }
  }

  // Bulk operations
  const handleBulkMarkCompleted = async () => {
    if (selectedTodos.length === 0) return
    
    setBulkLoading(true)
    try {
      // Update each selected todo
      const updatePromises = selectedTodos.map(id => 
        handleUpdateTodo(id, { completed: true })
      )
      await Promise.all(updatePromises)
      setSelectedTodos([])
      console.log(`${selectedTodos.length} tasks marked as completed`)
    } catch (error) {
      console.error('Failed to bulk update todos:', error)
      alert('Failed to update some tasks. Please try again.')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTodos.length === 0) return
    
    const confirmMessage = `Are you sure you want to delete ${selectedTodos.length} selected task(s)?\n\nThis action cannot be undone.`
    if (!confirm(confirmMessage)) return
    
    setBulkLoading(true)
    try {
      // Delete each selected todo
      const deletePromises = selectedTodos.map(id => handleDeleteTodo(id))
      await Promise.all(deletePromises)
      setSelectedTodos([])
      console.log(`${selectedTodos.length} tasks deleted`)
    } catch (error) {
      console.error('Failed to bulk delete todos:', error)
      alert('Failed to delete some tasks. Please try again.')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleSelectTodo = (id: string) => {
    setSelectedTodos(prev => 
      prev.includes(id) 
        ? prev.filter(todoId => todoId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const userTodos = filteredTodos.filter(todo => todo.userId === user?.id)
    if (selectedTodos.length === userTodos.length) {
      setSelectedTodos([])
    } else {
      setSelectedTodos(userTodos.map(todo => todo.id))
    }
  }

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'completed':
        return todo.completed
      case 'pending':
        return !todo.completed
      default:
        return true
    }
  })

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Create Todo Form */}
      <TodoForm onCreateTodo={handleCreateTodo} isLoading={isLoading} />

      {/* Stats Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                <div className="text-sm text-gray-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{totalCount - completedCount}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={loadTodos}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="flex items-center gap-2"
        >
          <Square className="h-4 w-4" />
          All Tasks
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
          className="flex items-center gap-2"
        >
          <Square className="h-4 w-4" />
          Pending ({totalCount - completedCount})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          className="flex items-center gap-2"
        >
          <CheckSquare className="h-4 w-4" />
          Completed ({completedCount})
        </Button>
      </div>

      {/* Bulk Operations */}
      {filteredTodos.filter(todo => todo.userId === user?.id).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  {selectedTodos.length === filteredTodos.filter(todo => todo.userId === user?.id).length 
                    ? 'Deselect All' 
                    : 'Select All'}
                </Button>
                {selectedTodos.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedTodos.length} task(s) selected
                  </span>
                )}
              </div>

              {selectedTodos.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkMarkCompleted}
                    disabled={bulkLoading}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Completed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkLoading}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todo List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {filter === 'all' && 'All Tasks'}
            {filter === 'pending' && 'Pending Tasks'}
            {filter === 'completed' && 'Completed Tasks'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading tasks...</span>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all' && 'No tasks yet. Create your first task above!'}
              {filter === 'pending' && 'No pending tasks. Great job!'}
              {filter === 'completed' && 'No completed tasks yet.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTodos.map((todo, index) => (
                <TodoItem
                  key={`todo-${todo.id}-${todo.userId}-${index}`}
                  todo={todo}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                  isOwner={todo.userId === user.id}
                  isSelected={selectedTodos.includes(todo.id)}
                  onSelect={todo.userId === user.id ? handleSelectTodo : undefined}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
