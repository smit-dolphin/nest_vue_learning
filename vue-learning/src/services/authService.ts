import { baseApi } from '../api/baseApi'

export interface UserProfile {
  id: string
  username: string | null
  email: string
  role: string
  profileImage: string | null
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