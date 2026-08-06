import api from '@/api'

export interface MediaUploadResponse {
  id: number
  path: string
  contentType: string
  size: number
}

export async function uploadArticleImage(file: File) {
  const body = new FormData()
  body.append('file', file)

  const response = await api.post<MediaUploadResponse>('/api/media', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}
