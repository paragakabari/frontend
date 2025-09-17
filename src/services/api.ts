import axios from 'axios'
import Cookies from 'js-cookie'
import { 
  LoginCredentials, 
  SignupCredentials, 
  AuthResponse, 
  Todo, 
  CreateTodoRequest, 
  UpdateTodoRequest,
  TodosResponse
} from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api'

// Debug: Log the API base URL
console.log('API_BASE:', API_BASE)
console.log('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    // Remove Authorization header if no valid token
    delete config.headers.Authorization
  }
  return config
})

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials)
    return {
      ...response.data.user,
      id: response.data.user._id || response.data.user.id,
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken
    }
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/me')
    const token = Cookies.get('token')
    const refreshToken = Cookies.get('refreshToken')
    return {
      ...response.data.user,
      id: response.data.user._id || response.data.user.id,
      token: token || '',
      refreshToken: refreshToken || ''
    }
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = Cookies.get('refreshToken')
    const response = await api.post('/auth/refresh', {
      refreshToken
    })
    return {
      id: '0', // Will be filled by current user data
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      gender: '',
      image: '',
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken
    }
  },

  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
      console.log('Making signup request to:', `${API_BASE}/auth/register`)
      console.log('Signup credentials:', credentials)
      const response = await api.post('/auth/register', credentials)
      console.log('Signup response:', response.data)
      return {
        ...response.data.user,
        id: response.data.user._id || response.data.user.id,
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken
      }
    } catch (error: any) {
      console.error('Signup error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      })
      throw error
    }
  }
}

// Todos API
export const todosAPI = {
  getUserTodos: async (userId?: string): Promise<TodosResponse> => {
    const response = await api.get('/todos')
    return {
      todos: response.data.data.todos.map((todo: any) => ({
        id: todo._id || todo.id,
        todo: todo.title,
        completed: todo.completed,
        userId: todo.user._id || todo.user.id || userId || '1'
      })),
      total: response.data.data.total,
      skip: response.data.data.skip || 0,
      limit: response.data.data.limit || 50
    }
  },

  getAllTodos: async (limit = 30, skip = 0): Promise<TodosResponse> => {
    const response = await api.get(`/todos?limit=${limit}&skip=${skip}`)
    return {
      todos: response.data.data.todos.map((todo: any) => ({
        id: todo._id || todo.id,
        todo: todo.title,
        completed: todo.completed,
        userId: todo.user._id || todo.user.id || '1'
      })),
      total: response.data.data.total,
      skip: response.data.data.skip || skip,
      limit: response.data.data.limit || limit
    }
  },

  getTodo: async (id: string): Promise<Todo> => {
    const response = await api.get(`/todos/${id}`)
    const todo = response.data.data
    return {
      id: todo._id || todo.id,
      todo: todo.title,
      completed: todo.completed,
      userId: todo.user._id || todo.user.id || '1'
    }
  },

  createTodo: async (todo: CreateTodoRequest): Promise<Todo> => {
    const response = await api.post('/todos', {
      title: todo.todo,
      completed: todo.completed
    })
    const newTodo = response.data.data
    return {
      id: newTodo._id || newTodo.id,
      todo: newTodo.title,
      completed: newTodo.completed,
      userId: newTodo.user._id || newTodo.user.id || todo.userId
    }
  },

  updateTodo: async (id: string, updates: UpdateTodoRequest): Promise<Todo> => {
    const updateData: any = {}
    if (updates.todo !== undefined) updateData.title = updates.todo
    if (updates.completed !== undefined) updateData.completed = updates.completed
    
    const response = await api.put(`/todos/${id}`, updateData)
    const updatedTodo = response.data.data
    return {
      id: updatedTodo._id || updatedTodo.id,
      todo: updatedTodo.title,
      completed: updatedTodo.completed,
      userId: updatedTodo.user._id || updatedTodo.user.id || '1'
    }
  },

  deleteTodo: async (id: string): Promise<Todo> => {
    await api.delete(`/todos/${id}`)
    return {
      id,
      todo: '',
      completed: false,
      userId: '1'
    }
  }
}

export default api
