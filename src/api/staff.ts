import api from '@/api'
import type { BackendArticleStatus, BackendArticleType } from '@/api/articles'

export interface StaffArticleDto {
  id: number
  authorId: number
  authorName: string
  coverImage: string
  categoryId: number
  categoryName: string
  title: string
  sapo: string
  content: string
  type: BackendArticleType
  status: BackendArticleStatus
  rejectionReason: string | null
  viewCount: number
  createdAt: string
}

export interface CategoryOption {
  id: number
  name: string
}

export interface StaffArticleCreatePayload {
  authorId: number
  categoryId: number
  coverImage: string
  title: string
  sapo: string
  content: string
  type: BackendArticleType
}

export interface StaffArticleUpdatePayload {
  categoryId: number
  coverImage: string
  title: string
  sapo: string
  content: string
  type: BackendArticleType
}

export interface ModerateArticleDecisionPayload {
  approved: boolean
  rejectionReason?: string
}

export interface AdminVipPackage {
  id: number
  name: string
  durationDays: number
  price: number
  discountPercent: number
  description: string
}

export interface AdminVipPackageUpdatePayload {
  name: string
  durationDays: number
  price: number
  discountPercent: number
  description: string
}

export async function fetchManageableArticles(keyword?: string) {
  const response = await api.get<StaffArticleDto[]>('/api/staff/articles', {
    params: keyword?.trim() ? { q: keyword.trim() } : undefined,
  })
  return response.data
}

export async function fetchCategories() {
  const response = await api.get<CategoryOption[]>('/api/categories')
  return response.data
}

export async function fetchManageableArticleDetail(articleId: number) {
  const response = await api.get<StaffArticleDto>(`/api/staff/articles/${articleId}`)
  return response.data
}

export async function createStaffArticle(payload: StaffArticleCreatePayload) {
  await api.post('/api/staff/articles/create', payload)
}

export async function updateStaffArticle(articleId: number, payload: StaffArticleUpdatePayload) {
  const response = await api.put<StaffArticleDto>(`/api/staff/articles/${articleId}`, payload)
  return response.data
}

export async function fetchPendingArticles() {
  const response = await api.get<StaffArticleDto[]>('/api/moderation/articles/pending')
  return response.data
}

export async function fetchPendingArticleDetail(articleId: number) {
  const response = await api.get<StaffArticleDto>(`/api/moderation/articles/${articleId}`)
  return response.data
}

export async function moderateArticle(articleId: number, payload: ModerateArticleDecisionPayload) {
  const response = await api.post<StaffArticleDto>(`/api/moderation/articles/${articleId}/decision`, payload)
  return response.data
}

export async function fetchVisibilityArticles(keyword?: string) {
  const response = await api.get<StaffArticleDto[]>('/api/moderation/articles/visibility', {
    params: keyword?.trim() ? { q: keyword.trim() } : undefined,
  })
  return response.data
}

export async function fetchVisibilityArticleDetail(articleId: number) {
  const response = await api.get<StaffArticleDto>(`/api/moderation/articles/${articleId}/visibility`)
  return response.data
}

export async function hideArticle(articleId: number) {
  const response = await api.post<StaffArticleDto>(`/api/moderation/articles/${articleId}/hide`)
  return response.data
}

export async function showArticle(articleId: number) {
  const response = await api.post<StaffArticleDto>(`/api/moderation/articles/${articleId}/show`)
  return response.data
}

export async function fetchAdminVipPackages() {
  const response = await api.get<AdminVipPackage[]>('/api/admin/vip-packages')
  return response.data.map(pkg => ({
    ...pkg,
    price: Number(pkg.price),
  }))
}

export async function updateAdminVipPackage(id: number, payload: AdminVipPackageUpdatePayload) {
  const response = await api.put<AdminVipPackage>(`/api/admin/vip-packages/${id}`, payload)
  return {
    ...response.data,
    price: Number(response.data.price),
  }
}