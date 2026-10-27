import api from '@/api'

export type NotificationType =
  | 'NEW_ARTICLE'
  | 'HOT_ARTICLE'
  | 'ARTICLE_APPROVED'
  | 'ARTICLE_REJECTED'
  | 'AUTHOR_ARTICLE_HOT'
  | 'ADMIN_REVIEW_REQUIRED'

export interface NewsNotification {
  id: number
  articleId: number
  articleImage: string
  categoryName: string
  articleType: 'FREE' | 'VIP'
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export async function fetchNotifications() {
  const response = await api.get<NewsNotification[]>('/api/me/notifications')
  return response.data
}

export async function fetchUnreadNotificationCount() {
  const response = await api.get<{ count: number }>('/api/me/notifications/unread-count')
  return Number(response.data.count) || 0
}

export async function markNotificationRead(notificationId: number) {
  await api.patch(`/api/me/notifications/${notificationId}/read`)
}

export async function markAllNotificationsRead() {
  await api.patch('/api/me/notifications/read-all')
}
