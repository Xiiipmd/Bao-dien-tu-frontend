import api from '@/api'
import type { ArticleSearchResponse, CategoryOption } from '@/api/articles'

export type NotificationType =
  | 'NEW_ARTICLE'
  | 'HOT_ARTICLE'
  | 'ARTICLE_APPROVED'
  | 'ARTICLE_REJECTED'
  | 'AUTHOR_ARTICLE_HOT'
  | 'ADMIN_REVIEW_REQUIRED'

export interface UserPreferences {
  selectedTopics: CategoryOption[]
  pushNotificationsEnabled: boolean
}

export interface NewsNotification {
  id: number
  articleId: number
  articleImage: string
  categoryName: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

export async function fetchPreferences() {
  const response = await api.get<UserPreferences>('/api/me/preferences')
  return response.data
}

export async function updatePreferences(categoryIds: number[], pushNotificationsEnabled: boolean) {
  const response = await api.put<UserPreferences>('/api/me/preferences', {
    categoryIds,
    pushNotificationsEnabled,
  })
  return response.data
}

export async function fetchPersonalizedArticles() {
  const response = await api.get<ArticleSearchResponse[]>('/api/articles/personalized')
  return response.data
}

export async function fetchNotifications() {
  const response = await api.get<NewsNotification[]>('/api/me/notifications')
  return response.data
}

export async function markNotificationRead(notificationId: number) {
  await api.patch(`/api/me/notifications/${notificationId}/read`)
}

export async function markAllNotificationsRead() {
  await api.patch('/api/me/notifications/read-all')
}
