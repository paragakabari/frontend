export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

export interface LoginCredentials {
  username: string
  password: string
  expiresInMins?: number
}

export interface SignupCredentials {
  username: string
  password: string
  email: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
  token: string
  refreshToken: string
}

export interface Todo {
  id: string
  todo: string
  completed: boolean
  userId: string
}

export interface CreateTodoRequest {
  todo: string
  completed?: boolean
  userId: string
}

export interface UpdateTodoRequest {
  todo?: string
  completed?: boolean
}

export interface TodosResponse {
  todos: Todo[]
  total: number
  skip: number
  limit: number
}

export interface ActivityConfig {
  inactivityTimeout: number // in minutes
  warningTime: number // in seconds
  enabled: boolean
}

export interface UserPreferences {
  staySignedIn: boolean
  activityConfig: ActivityConfig
}
