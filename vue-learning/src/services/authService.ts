import { baseApi } from '../api/baseApi'

export interface UserProfile {
  id: string
  username: string | null
  email: string
  role: string
  createdAt: string
}

export interface msg {
  msg:string
}

export async function getMyProfile(): Promise<UserProfile> {
  const result = await baseApi.get<UserProfile>('/auth/me')

  return result as unknown as UserProfile
}

export async function logoutMe(): Promise<msg> {
  const result = await baseApi.post<msg>('/auth/logout')
  return result as unknown as msg
}