import { baseApi } from '@/api/baseApi'
import { unwrap } from '@/api/types'
import type { UserSettings } from '@/types'

export type UpdateUserSettingsPayload = Partial<
  Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>

export async function getUserSettings(): Promise<UserSettings> {
  const result = await baseApi.get<UserSettings>('/settings/user')
  return result as unknown as UserSettings
}

export async function updateUserSettings(
  payload: UpdateUserSettingsPayload,
): Promise<UserSettings> {
  const result = await baseApi.patch<UserSettings>('/settings/user', payload)
  const envelope = unwrap<UserSettings>(result)
  return envelope.data
}