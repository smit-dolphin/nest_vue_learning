import type { ApiResponse } from '@/api/types'
import { baseApi } from '@/api/baseApi'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/stores/authStore'

export interface AuthResult {
  message: string
  user: User
  accessToken: string
}

export interface MessageResult {
  message: string
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const result = await baseApi.post<AuthResult>('/auth/login', { email, password })
  const envelope = result as unknown as ApiResponse<AuthResult>
  return {
    message: envelope.message,
    user: envelope.data.user,
    accessToken: envelope.data.accessToken,
  }
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<AuthResult> {
  const result = await baseApi.post<AuthResult>('/auth/register', {
    username,
    email,
    password,
  })
  const envelope = result as unknown as ApiResponse<AuthResult>
  return {
    message: envelope.message,
    user: envelope.data.user,
    accessToken: envelope.data.accessToken,
  }
}

export async function logoutMe(): Promise<MessageResult> {
  const result = await baseApi.post<unknown>('/auth/logout')
  const envelope = result as unknown as ApiResponse<unknown>
  return { message: envelope.message }
}

export async function getMyProfile(): Promise<User> {
  const result = await baseApi.get<User>('/auth/me')
  const envelope = result as unknown as ApiResponse<User>
  return envelope.data
}

export async function updateProfile(payload: { username?: string }): Promise<User> {
  const result = await baseApi.patch<User>('/auth/me', payload)
  const envelope = result as unknown as ApiResponse<User>
  return envelope.data
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<MessageResult> {
  const result = await baseApi.post<unknown>('/auth/change-password', {
    currentPassword,
    newPassword,
  })
  const envelope = result as unknown as ApiResponse<unknown>
  return { message: envelope.message }
}

export async function uploadProfileImage(file: File): Promise<User> {
  const formData = new FormData()
  formData.append('image', file)
  const result = await baseApi.post<User>('/auth/profile-image', formData)
  const envelope = result as unknown as ApiResponse<User>
  return envelope.data
}

export function getProfileImageUrl(): string {
  const authStore = useAuthStore()
  const value = authStore.user?.profileImage

  if (!value) return ''

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  const token = authStore.accessToken
  return `${baseApi.defaults.baseURL}/auth/profile-image?token=${encodeURIComponent(token ?? '')}&v=${encodeURIComponent(value)}`
}

export function startGoogleAuth(): void {
  window.location.assign(`${baseApi.defaults.baseURL}/auth/google`)
}

export async function exchangeGoogleCode(code: string): Promise<AuthResult> {
  const result = await baseApi.post<AuthResult>('/auth/google/exchange', { code })
  const envelope = result as unknown as ApiResponse<AuthResult>
  return {
    message: envelope.message,
    user: envelope.data.user,
    accessToken: envelope.data.accessToken,
  }
}