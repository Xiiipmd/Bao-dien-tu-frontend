import api from '@/api'

export type AccountRole = 'MEMBER' | 'VIP' | 'AUTHOR' | 'CENSOR' | 'ADMIN'

export interface AccountProfile {
  id: number
  fullName: string
  email: string
  role: AccountRole
  vipExpiryDate: string | null
  createdAt: string
  avatar: string | null
  freeArticlesLeft: number
}

export interface MediaUploadResponse {
  id: number
  path: string
  contentType: string
  size: number
}

export async function fetchAccountProfile() {
  const response = await api.get<AccountProfile>('/api/me/account')
  return response.data
}

export async function updateAccountProfile(payload: { fullName: string; email: string }) {
  const response = await api.put<AccountProfile>('/api/me/account', payload)
  return response.data
}

export async function updateAccountAvatar(avatar: string) {
  const response = await api.patch<AccountProfile>('/api/me/account/avatar', { avatar })
  return response.data
}

export async function uploadAccountAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<MediaUploadResponse>('/api/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30_000,
  })
  return response.data
}

export async function changeAccountPassword(payload: {
  currentPassword: string
  newPassword: string
  confirmation: string
}) {
  await api.put('/api/me/account/password', payload)
}
