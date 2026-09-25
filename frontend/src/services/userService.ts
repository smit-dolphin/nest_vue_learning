import { baseApi } from '@/api/baseApi'
import { unwrap, type ListQuery, type Paginated } from '@/api/types'
import type { UserRole, UserSettings } from '@/types'

export interface AdminUser {
  id: string
  username: string | null
  email: string
  profileImage: string | null
  googleId: string | null
  settings: UserSettings | null
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface ListUsersQuery extends ListQuery {
  role?: UserRole | string
}

export interface MessageResult {
  message: string
}

export async function getUsers(query: ListUsersQuery = {}): Promise<Paginated<AdminUser>> {
  const result = await baseApi.get<AdminUser>('/users', { params: query })
  const envelope = unwrap<AdminUser[]>(result)
  return { items: envelope.data, meta: envelope.meta! }
}

export async function getSingleUser(id: string): Promise<AdminUser> {
  const result = await baseApi.get<AdminUser>(`/users/${id}`)
  const envelope = unwrap<AdminUser>(result)
  return envelope.data
}

export async function createUser(email: string, password: string): Promise<AdminUser> {
  const result = await baseApi.post<AdminUser>('/users', { email, password })
  const envelope = unwrap<AdminUser>(result)
  return envelope.data
}

export async function updateUser(
  id: string,
  body: Partial<{ email: string; password: string }>,
): Promise<AdminUser> {
  const result = await baseApi.patch<AdminUser>(`/users/${id}`, body)
  const envelope = unwrap<AdminUser>(result)
  return envelope.data
}

export async function deleteUser(id: string): Promise<MessageResult> {
  const result = await baseApi.delete<unknown>(`/users/${id}`)
  const envelope = unwrap<unknown>(result)
  return { message: envelope.message }
}