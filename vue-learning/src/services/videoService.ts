import { baseApi } from '../api/baseApi'

export interface SubtitleSettings {
  leng: string
  formate: string
  timestamps: boolean
  lables: boolean
  autoTranslate: boolean
  autoPunctuation: boolean
  wordLevelTiming: boolean
  burnVideo: boolean
}

export const uploadVideo = async (
  file: File,
  params: SubtitleSettings,
) => {
  const formData = new FormData()

  formData.append('video', file)

  const response = await baseApi.post('/videos', formData, {
    params: {
      leng: params.leng,
      formate: params.formate,
      lables: params.lables,
      autoTranslate: params.autoTranslate,
      autoPunctuation: params.autoPunctuation,
      wordLevelTiming: params.wordLevelTiming,
      burnVideo: params.burnVideo,
    },
  })

  return response
}

export const generateSubtitle = async (videoId: string) => {
  const response = await baseApi.post(`/subtitle/${videoId}`)

  return response
}
