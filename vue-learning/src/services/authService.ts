import { baseApi } from '../api/baseApi'
import { useAuthStore } from '../stores/authStore'

export interface UserSettings {
  defaultLang: string
  defaultFormat: string
  autoDownload: boolean
  darkMode: boolean
  compactView: boolean
  notifications: {
    jobComplete: boolean
    jobFailed: boolean
    weeklyReport: boolean
    productUpdates: boolean
    marketing: boolean
  }
}

export interface UserProfile {
  id: string
  username: string | null
  email: string
  role: string
  profileImage: string | null
  googleId: string | null
  settings: UserSettings | null
  createdAt: string
}

export interface msg {
  msg:string
}

export interface AuthResult {
  message: string
  user: UserProfile
  accessToken: string
}

export async function getMyProfile(): Promise<UserProfile> {
  const result = await baseApi.get<UserProfile>('/auth/me')

  return result as unknown as UserProfile
}

export async function updateProfile(payload: { username?: string }): Promise<UserProfile> {
  const result = await baseApi.patch<UserProfile>('/auth/me', payload)

  return result as unknown as UserProfile
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<msg> {
  const result = await baseApi.post<msg>('/auth/change-password', { currentPassword, newPassword })

  return result as unknown as msg
}

export async function uploadProfileImage(file: File): Promise<UserProfile> {
  const formData = new FormData()
  formData.append('image', file)

  const result = await baseApi.post<UserProfile>('/auth/profile-image', formData)

  return result as unknown as UserProfile
}

export async function getUserSettings(): Promise<UserSettings> {
  const result = await baseApi.get<UserSettings>('/auth/settings')

  return result as unknown as UserSettings
}

export async function updateUserSettings(payload: Partial<UserSettings>): Promise<UserSettings> {
  const result = await baseApi.patch<UserSettings>('/auth/settings', payload)

  return result as unknown as UserSettings
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
  return result as unknown as AuthResult
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const result = await baseApi.post<AuthResult>('/auth/login', { email, password })
  return result as unknown as AuthResult
}

export async function registerUser(username: string, email: string, password: string): Promise<AuthResult> {
  const result = await baseApi.post<AuthResult>('/auth/register', { username, email, password })
  return result as unknown as AuthResult
}

export async function logoutMe(): Promise<msg> {
  const result = await baseApi.post<msg>('/auth/logout')
  return result as unknown as msg
}