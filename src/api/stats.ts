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
