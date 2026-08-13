import api from '@/api'

export type AdminUserRole = 'MEMBER' | 'VIP' | 'AUTHOR' | 'CENSOR' | 'ADMIN'
export type AdminUserStatus = 'ACTIVE' | 'LOCKED'

export interface AdminUser {
  id: number
  fullName: string
  email: string
  role: AdminUserRole
  status: AdminUserStatus
  createdAt: string
}

export async function fetchAdminUsers(keyword?: string) {
  const response = await api.get<AdminUser[]>('/api/admin/users', {
    params: keyword?.trim() ? { q: keyword.trim() } : undefined,
  })
  return response.data
}

export async function updateAdminUserRole(userId: number, role: AdminUserRole) {
  const response = await api.patch<AdminUser>(`/api/admin/users/${userId}/role`, { role })
  return response.data
}

export async function updateAdminUserStatus(userId: number, status: AdminUserStatus) {
  const response = await api.patch<AdminUser>(`/api/admin/users/${userId}/status`, { status })
  return response.data
}
