<template>
  <div class="container mx-auto px-4 py-8 lg:px-8">
    <div v-if="loading" class="flex min-h-[60vh] items-center justify-center text-gray-500">Đang tải bài viết...</div>
    <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">{{ error }}</div>
    <div v-else-if="!featuredArticle" class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-500">
      Chưa có bài viết xuất bản để hiển thị.
    </div>
    <template v-else>
    <!-- Hero Section -->
    <section class="mb-16">
      <div class="relative overflow-hidden rounded-2xl bg-slate-900 group">
        <img
          :src="featuredArticle.image"
          :alt="featuredArticle.title"
          class="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div class="relative flex min-h-[500px] flex-col justify-end p-8 md:p-12 lg:w-2/3">
          <span class="mb-4 inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
            Tiêu điểm
          </span>
          <h1 class="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            {{ featuredArticle.title }}
          </h1>
          <p class="mb-8 max-w-2xl text-lg text-gray-200 line-clamp-2">{{ featuredArticle.excerpt }}</p>
          <RouterLink
            :to="`/article/${featuredArticle.id}`"
            class="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
          >
            Đọc ngay <ArrowRight class="h-4 w-4" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <!-- Left Column: Article Grid -->
      <div class="lg:col-span-8">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <span v-if="isPersonalized" class="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-blue-600">
              <Sparkles class="h-3.5 w-3.5" /> Dành riêng cho bạn
            </span>
            <h2 class="text-2xl font-bold text-gray-900">{{ isPersonalized ? 'Tin theo sở thích' : 'Tin mới nhất' }}</h2>
          </div>
          <RouterLink to="/search" class="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Xem tất cả <ChevronRight class="h-4 w-4" />
          </RouterLink>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <ArticleCard v-for="article in gridArticles" :key="article.id" :article="article" />
        </div>
      </div>

      <!-- Right Column: Sidebar -->
      <aside class="lg:col-span-4 space-y-10">
        <!-- Categories Widget -->
        <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 class="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
            <div class="h-4 w-1 bg-blue-600 rounded-full" />
            Danh mục
          </h3>
          <ul class="space-y-3">
            <li v-for="cat in categories" :key="cat">
              <RouterLink
                :to="`/search?category=${encodeURIComponent(cat)}`"
                class="flex items-center justify-between rounded-lg p-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
              >
                {{ cat }}
                <ChevronRight class="h-4 w-4 text-gray-400" />
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Trending Widget -->
        <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 class="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp class="h-5 w-5 text-blue-600" />
            <span>
              Bài viết nổi bật
              <span class="mt-0.5 block text-xs font-medium text-gray-400">3 ngày gần nhất</span>
            </span>
          </h3>
          <div class="space-y-6">
            <RouterLink
              v-for="(article, index) in trendingArticles"
              :key="article.id"
              :to="`/article/${article.id}`"
              class="group flex gap-4"
            >
              <div class="flex-shrink-0 text-3xl font-black text-gray-200 group-hover:text-blue-200 transition-colors">
                0{{ index + 1 }}
              </div>
              <div>
                <h4 class="mb-1 font-bold leading-tight text-gray-900 group-hover:text-blue-600 line-clamp-2">{{ article.title }}</h4>
                <span class="text-xs text-gray-500">{{ article.date }}</span>
              </div>
            </RouterLink>
          </div>
        </div>
      </aside>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, ChevronRight, Sparkles, TrendingUp } from 'lucide-vue-next'
import ArticleCard from '@/components/ArticleCard.vue'
import {
  fetchCategories,
  fetchHomeArticles,
  fetchTrendingArticles,
  toArticleCardViewModel,
  type ArticleCardViewModel,
} from '@/api/articles'
import { fetchPreferences } from '@/api/personalization'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const articles = ref<ArticleCardViewModel[]>([])
const trendingArticles = ref<ArticleCardViewModel[]>([])
const categories = ref<string[]>([])
const loading = ref(true)
const error = ref('')
const isPersonalized = ref(false)

const featuredArticle = computed(() => articles.value[0] ?? null)
const gridArticles = computed(() => articles.value.slice(1, 5))

onMounted(loadArticles)

async function loadArticles() {
  loading.value = true
  error.value = ''
  try {
    const articleRequest = fetchHomeArticles()
    const [articleResult, categoryResult, preferenceResult, trendingResult] = await Promise.allSettled([
      articleRequest,
      fetchCategories(),
      auth.isLoggedIn ? fetchPreferences() : Promise.resolve(null),
      fetchTrendingArticles(),
    ])

    if (articleResult.status === 'rejected') {
      throw articleResult.reason
    }

    articles.value = articleResult.value.map(toArticleCardViewModel)
    trendingArticles.value = trendingResult.status === 'fulfilled'
      ? trendingResult.value.map(toArticleCardViewModel)
      : []
    isPersonalized.value = preferenceResult.status === 'fulfilled'
      && Boolean(preferenceResult.value?.selectedTopics.length)

    if (categoryResult.status === 'fulfilled') {
      categories.value = categoryResult.value.map(category => category.name)
    } else {
      categories.value = []
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải danh sách bài viết. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>
