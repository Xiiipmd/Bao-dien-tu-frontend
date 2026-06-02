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
  articleType: 'FREE' | 'VIP' | null
  views: number
  revenue: number
}

export interface TopicStatDto {
  categoryId: number
  categoryName: string
  articles: number
  followers: number
  views: number
  freeViews: number
  vipViews: number
  revenue: number
}

export interface AuthorStatDto {
  totalArticles: number
  totalViews: number
  totalRevenue: number
  totalFollowers: number
  periodUnit: 'hour' | 'day' | 'month'
  freeViewPrice: number
  vipViewPrice: number
  chart: AuthorStatPointDto[]
  topArticles: TopArticleStatDto[]
  topicStats: TopicStatDto[]
}

export type StatGroupBy = 'hour' | 'day' | 'month'
export type AdminTopTarget = 'author' | 'category'
export type AdminTopSort = 'revenue' | 'views'

export interface StatOptionDto {
  id: number
  name: string
}

export interface AdminStatDetailDto {
  period: string
  authorId: number
  authorName: string
  categoryId: number
  categoryName: string
  articles: number
  views: number
  revenue: number
}

export interface AdminOverviewStatDto {
  totalArticles: number
  totalViews: number
  totalRevenue: number
  periodUnit: StatGroupBy
  freeViewPrice: number
  vipViewPrice: number
  chart: AuthorStatPointDto[]
  details: AdminStatDetailDto[]
}

export interface AdminTopStatDto {
  rank: number
  targetType: AdminTopTarget
  targetId: number
  targetName: string
  articles: number
  views: number
  revenue: number
}

export interface ArticleStatDto {
  views: number;
  estimatedEarning: number;
  viewsByLevelOfGranularity: number[];
}

export async function fetchArticleStats(
  articleId: number,
  startDate: string,
  endDate: string,
  granularity: 'hour' | 'day' | 'month',
) {
  const response = await api.get<ArticleStatDto>('/api/stats/article', {
    params: {
      articleId,
      startDate,
      endDate,
      granularity,
    },
  })

  return response.data
}

export async function fetchAuthorStats(
  authorId: number,
  startDate: string,
  endDate: string,
  groupBy: StatGroupBy,
) {
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

export async function fetchAdminStatAuthors() {
  const response = await api.get<StatOptionDto[]>('/api/stats/admin/authors')
  return response.data
}

export async function fetchAdminOverviewStats(params: {
  authorId?: number | null
  categoryId?: number | null
  startDate: string
  endDate: string
  groupBy: StatGroupBy
}) {
  const response = await api.get<AdminOverviewStatDto>('/api/stats/admin/overview', {
    params: compactParams(params),
  })

  return response.data
}

export async function fetchAdminTopStats(params: {
  targetType: AdminTopTarget
  sortBy: AdminTopSort
  startDate: string
  endDate: string
  limit: number
}) {
  const response = await api.get<AdminTopStatDto[]>('/api/stats/admin/top', {
    params: compactParams(params),
  })

  return response.data
}

function compactParams(params: Record<string, string | number | null | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined && value !== ''),
  )
}
