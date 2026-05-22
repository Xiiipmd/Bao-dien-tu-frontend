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

export async function fetchAuthorStats(authorId: number, startDate: string, endDate: string) {
  const response = await api.get<AuthorStatDto>('/api/stats/author', {
    params: {
      authorId,
      startDate,
      endDate,
    },
  })

  return response.data
}