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

    <!-- Compact category navigation -->
    <section v-if="categories.length" class="mb-12 border-y border-slate-200 py-4">
      <div class="flex items-center gap-3">
        <div class="flex shrink-0 items-center gap-2 pr-2 text-sm font-bold text-slate-900">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <LayoutGrid class="h-4 w-4" />
          </span>
          <span class="hidden sm:inline">Chuyên mục</span>
        </div>
        <nav
          aria-label="Chuyên mục bài viết"
          class="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0"
        >
          <RouterLink
            v-for="cat in categories"
            :key="cat"
            :to="`/search?category=${encodeURIComponent(cat)}`"
            class="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            {{ cat }}
          </RouterLink>
        </nav>
      </div>
    </section>

    <!-- Main Content Layout -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-12 xl:gap-10">
      <!-- Left Column: Article Grid -->
      <div class="lg:col-span-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Tin mới nhất</h2>
          <RouterLink to="/search" class="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Xem tất cả <ChevronRight class="h-4 w-4" />
          </RouterLink>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <ArticleCard v-for="article in gridArticles" :key="article.id" :article="article" />
        </div>
      </div>

      <!-- Right Column: Sidebar -->
      <aside class="lg:col-span-4">
        <!-- Trending Widget -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h3 class="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <TrendingUp class="h-4 w-4" />
            </span>
            Bài viết nổi bật
          </h3>
          <p class="mb-5 pl-11 text-sm text-slate-500">Những bài đang được độc giả quan tâm</p>
          <div class="divide-y divide-slate-100">
            <RouterLink
              v-for="(article, index) in trendingArticles"
              :key="article.id"
              :to="`/article/${article.id}`"
              class="group flex gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div class="flex-shrink-0 text-2xl font-black text-slate-200 transition-colors group-hover:text-blue-200">
                0{{ index + 1 }}
              </div>
              <div class="min-w-0">
                <h4 class="mb-1 line-clamp-2 font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600">{{ article.title }}</h4>
                <span class="text-xs font-medium uppercase tracking-wide text-gray-400">{{ article.category }} · {{ article.date }}</span>
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
import { ArrowRight, ChevronRight, LayoutGrid, TrendingUp } from 'lucide-vue-next'
import ArticleCard from '@/components/ArticleCard.vue'
import { fetchCategories, fetchPublicArticles, toArticleCardViewModel, type ArticleCardViewModel } from '@/api/articles'

const articles = ref<ArticleCardViewModel[]>([])
const categories = ref<string[]>([])
const loading = ref(true)
const error = ref('')

const featuredArticle = computed(() => articles.value[0] ?? null)
const gridArticles = computed(() => articles.value.slice(1, 5))
const trendingArticles = computed(() => articles.value.slice(0, 3))

onMounted(loadArticles)

async function loadArticles() {
  loading.value = true
  error.value = ''
  try {
    const [articleResult, categoryResult] = await Promise.allSettled([
      fetchPublicArticles(),
      fetchCategories(),
    ])

    if (articleResult.status === 'rejected') {
      throw articleResult.reason
    }

    articles.value = articleResult.value.map(toArticleCardViewModel)

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
