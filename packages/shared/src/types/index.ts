// User types
export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: 'member' | 'admin'
  created_at: string
  last_login?: string
  is_active: boolean
}

// Streamer Profile types
export interface StreamerProfile {
  id: number
  user_id: string
  display_name: string
  description?: string
  avatar_url?: string
  twitter_handle?: string
  youtube_channel?: string
  twitch_channel?: string
  join_phase: 'phase01' | 'phase02' | 'phase03'
  created_at: string
  updated_at: string
}

// Stream Status types
export interface StreamStatus {
  id: number
  streamer_id: number
  is_live: boolean
  platform?: string
  title?: string
  viewer_count?: number
  stream_url?: string
  last_updated: string
}

// News types
export interface News {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  published: boolean
  created_by: string
  created_at: string
  updated_at: string
}

// Approved Email types
export interface ApprovedEmail {
  id: number
  email: string
  approved_at: string
  approved_by?: string
  notes?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Authentication types
export interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  role: 'member' | 'admin'
}

export interface GoogleOAuthUser {
  id: string
  email: string
  name: string
  picture?: string
}

export interface JWTPayload {
  sub: string
  email: string
  name: string
  role: string
  iat: number
  exp: number
}

// Database types
export type DatabaseResult<T = any> = {
  success: boolean
  results?: T[]
  meta?: {
    duration: number
    rows_read: number
    rows_written: number
  }
}

// API endpoints types
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiEndpoint {
  method: ApiMethod
  path: string
  requireAuth?: boolean
  requireAdmin?: boolean
}

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>