import api from '@/api'

export type BackendArticleType = 'FREE' | 'VIP'
export type BackendArticleStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN'

export interface ArticleCardViewModel {
  id: string
  title: string
  excerpt: string
  image: string
  isVip: boolean
  category: string
  authorId: number
  authorName?: string
  date?: string
  createdAt?: string
}

export interface ArticleDetailViewModel {
  id: number
  title: string
  sapo: string
  content: string
  image: string
  authorId: number
  authorName: string
  categoryName: string
  isVip: boolean
  date: string
  createdAt: string
  viewCount: number
  vipAccessGranted: boolean
  meteredAccessApplied: boolean
  remainingFreeReads: number | null
  accessMessage: string
}

export interface ArticleCommentViewModel {
  id: number
  user: string
  avatar: string
  content: string
  time: string
  createdAt: string
  userId: number
}

export interface ArticleSearchResponse {
  id: number
  title: string
  sapo: string
  coverImage: string
  authorId: number
  authorName: string
  categoryName: string
  type: BackendArticleType
  createdAt: string
}

export interface ArticlePreviewResponse {
  id: number
  title: string
  sapo: string
  coverImage: string
  previewContent: string
  authorId: number
  authorName: string
  categoryName: string
  type: BackendArticleType
  paywallRequired: boolean
}

export interface ArticleReadResponse {
  id: number
  title: string
  sapo: string
  content: string
  coverImage: string
  authorId: number
  authorName: string
  categoryName: string
  type: BackendArticleType
  viewCount: number
  createdAt: string
  vipAccessGranted: boolean
  meteredAccessApplied: boolean
  remainingFreeReads: number | null
  accessMessage: string
}

export interface ArticleCommentResponse {
  id: number
  articleId: number
  userId: number
  userName: string
  content: string
  createdAt: string
  user?: {
    id: number
    displayName: string
    avatarUrl?: string
  }
}

export interface ArticleSearchFilters {
  keyword?: string
  categoryId?: number | null
  authorName?: string
  authorId?: number
}

export interface CategoryOption {
  id: number
  name: string
}

export async function fetchPublicArticles(filters: ArticleSearchFilters = {}) {
  const response = await api.get<ArticleSearchResponse[]>('/api/articles/search', {
    params: buildSearchParams(filters),
  })
  return response.data
}

export async function fetchCategories() {
  const response = await api.get<CategoryOption[]>('/api/categories')
  return response.data
}

export async function fetchArticlePreview(articleId: number) {
  const response = await api.get<ArticlePreviewResponse>(`/api/articles/${articleId}/preview`)
  return response.data
}

export async function fetchArticleRead(articleId: number) {
  const response = await api.get<ArticleReadResponse>(`/api/articles/${articleId}/read`)
  return response.data
}

export async function fetchArticleComments(articleId: number) {
  const response = await api.get<ArticleCommentResponse[]>(`/api/articles/${articleId}/comments`)
  return response.data
}

export async function createArticleComment(articleId: number, content: string) {
  const response = await api.post<ArticleCommentResponse>(`/api/articles/${articleId}/comments`, { content })
  return response.data
}

export async function downloadArticlePdf(articleId: number) {
  const response = await api.get<Blob>(`/api/articles/${articleId}/download-pdf`, {
    responseType: 'blob',
  })
  return response.data
}

export function toArticleCardViewModel(article: ArticleSearchResponse): ArticleCardViewModel {
  return {
    id: String(article.id),
    title: article.title,
    excerpt: article.sapo,
    image: article.coverImage,
    isVip: article.type === 'VIP',
    category: article.categoryName,
    authorId: article.authorId,
    authorName: article.authorName,
    date: formatDate(article.createdAt),
    createdAt: formatDate(article.createdAt),
  }
}

export function toArticleDetailViewModel(article: ArticleReadResponse): ArticleDetailViewModel {
  return {
    id: article.id,
    title: article.title,
    sapo: article.sapo,
    content: article.content,
    image: article.coverImage,
    authorId: article.authorId,
    authorName: article.authorName,
    categoryName: article.categoryName,
    isVip: article.type === 'VIP',
    date: formatDate(article.createdAt),
    createdAt: article.createdAt,
    viewCount: article.viewCount,
    vipAccessGranted: article.vipAccessGranted,
    meteredAccessApplied: article.meteredAccessApplied,
    remainingFreeReads: article.remainingFreeReads,
    accessMessage: article.accessMessage,
  }
}

export function toArticleCommentViewModel(comment: ArticleCommentResponse): ArticleCommentViewModel {
  const avatarUrl = comment.user?.avatarUrl
    ? comment.user.avatarUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=eff6ff&color=1d4ed8`
  return {
    id: comment.id,
    user: comment.userName,
    avatar: avatarUrl,
    content: comment.content,
    time: formatRelativeTime(comment.createdAt),
    createdAt: comment.createdAt,
    userId: comment.userId,
  }
}

export function formatDate(value?: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatRelativeTime(value?: string | null) {
  if (!value) {
    return 'Vừa xong'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Vừa xong'
  }

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} giờ trước`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    return `${diffDays} ngày trước`
  }

  return formatDate(value)
}

function buildSearchParams(filters: ArticleSearchFilters) {
  const params: Record<string, string | number> = {}

  if (filters.keyword && filters.keyword.trim()) {
    params.keyword = filters.keyword.trim()
  }
  if (filters.categoryId) {
    params.categoryId = filters.categoryId
  }
  if (filters.authorName && filters.authorName.trim()) {
    params.authorName = filters.authorName.trim()
  }
  if (filters.authorId) {
    params.authorId = filters.authorId
  }

  return params
}
