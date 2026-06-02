import api from '@/api'

export interface AuthorStatPointDto {
  date: string | null
  views: number
  revenue: number
}

export interface TopArticleStatDto {
  articleId: number
  title: string
  publishedAt: string
  views: number
}

export interface AuthorStatDto {
  totalArticles: number
  totalViews: number
  totalRevenue: number
  chart: AuthorStatPointDto[]
  topArticles: TopArticleStatDto[]
}

export interface AdminStatDetailDto {
  period: string
  authorId: number | null
  authorName: string | null
  categoryId: number | null
  categoryName: string | null
  articles: number
  views: number
  revenue: number
}

export interface AdminOverviewStatDto {
  totalArticles: number
  totalViews: number
  totalRevenue: number
  periodUnit: 'hour' | 'day' | 'month'
  freeViewPrice: number
  vipViewPrice: number
  chart: AuthorStatPointDto[]
  details: AdminStatDetailDto[]
}

export interface AdminTopStatDto {
  rank: number
  targetType: 'author' | 'category'
  targetId: number
  targetName: string
  articles: number
  views: number
  revenue: number
}

export interface StatOptionDto {
  id: number
  name: string
}

export async function fetchAuthorStats(authorId: number, startDate: string, endDate: string, groupBy = 'day') {
  const response = await api.get<AuthorStatDto>('/api/stats/author', {
    params: {
      authorId,
      startDate,
      endDate,
      groupBy,
    },
  })

  return response.data
}

export async function fetchAdminOverviewStats(params: {
  startDate: string
  endDate: string
  authorId?: number
  categoryId?: number
  groupBy?: 'hour' | 'day' | 'month'
}) {
  const response = await api.get<AdminOverviewStatDto>('/api/stats/admin/overview', {
    params,
  })

  return response.data
}

export async function fetchAdminTopStats(params: {
  startDate: string
  endDate: string
  targetType?: 'author' | 'category'
  sortBy?: 'revenue' | 'views'
  limit?: number
}) {
  const response = await api.get<AdminTopStatDto[]>('/api/stats/admin/top', {
    params,
  })

  return response.data
}

export async function fetchAdminAuthorOptions() {
  const response = await api.get<StatOptionDto[]>('/api/stats/admin/authors')
  return response.data
}