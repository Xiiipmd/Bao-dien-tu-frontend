import api from '@/api'

export type SubscriptionTargetType = 'AUTHOR' | 'CATEGORY'

export interface SubscriptionResponse {
  id: number
  targetType: SubscriptionTargetType
  targetId: number
  targetName: string
}

export async function fetchMySubscriptions() {
  const response = await api.get<SubscriptionResponse[]>('/api/subscriptions/my')
  return response.data
}

export async function subscribeToTarget(targetType: SubscriptionTargetType, targetId: number) {
  const response = await api.post<SubscriptionResponse>('/api/subscriptions', {
    targetType,
    targetId,
  })
  return response.data
}

export async function unsubscribeFromTarget(targetType: SubscriptionTargetType, targetId: number) {
  await api.delete(`/api/subscriptions/${targetType}/${targetId}`)
}