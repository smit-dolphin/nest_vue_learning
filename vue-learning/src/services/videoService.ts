import { baseApi } from '../api/baseApi'

// export interface UserProfile {
//   id: string
//   username: string | null
//   email: string
//   role: string
//   createdAt: string
// }

// export interface msg {
//   msg:string
// }

// export async function getMyProfile(): Promise<UserProfile> {
//   const result = await baseApi.get<UserProfile>('/auth/me')

//   return result as unknown as UserProfile
// }

// export async function logoutMe(): Promise<msg> {
//   const result = await baseApi.post<msg>('/auth/logout')
//   return result as unknown as msg
// }
export const uploadVideo = async (file: File) => {
  const formData = new FormData()

  formData.append('video', file)

  const response = await baseApi.post(
    '/videos',
    formData
  )

  return response
}

export const genrateSubtitle=async (videoId:string) => {
    const response=await baseApi.post(`/subtitle/${videoId}`)
    return response
}