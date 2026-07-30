import api from '@/api'

export interface UserProfile {
  id: number
  fullName: string
  email: string
  role: string
  vipExpiryDate: string | null
  createdAt: string | null
}

export async function fetchUserProfile() {
  const response = await api.get<UserProfile>('/api/me/account')
  return response.data
}

export async function updateUserProfile(payload: { fullName: string; email: string }) {
  const response = await api.put<UserProfile>('/api/me/account', payload)
  return response.data
}

export async function changeUserPassword(payload: {
  currentPassword: string
  newPassword: string
  confirmation: string
}) {
  await api.put('/api/me/account/password', payload)
}
