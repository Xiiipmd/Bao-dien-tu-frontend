<template>
  <div class="container mx-auto px-4 py-8 lg:px-8">
    <!-- Search Bar & Filters -->
    <div class="mb-10 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <form @submit.prevent="handleSearch" class="mb-6 relative">
        <SearchIcon class="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
        <input
          v-model="searchInput"
          name="q"
          type="text"
          placeholder="Tìm kiếm bài viết, tác giả, nội dung..."
          class="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 pl-14 pr-4 text-lg outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
        />
        <button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
          Tìm kiếm
        </button>
      </form>

      <div class="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-6">
        <div class="flex items-center gap-2 text-gray-700 font-medium">
          <Filter class="h-5 w-5" /> Bộ lọc:
        </div>

        <select
          v-model="categoryFilter"
          @change="applyFilters"
          class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tất cả danh mục</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <select class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option value="">Tất cả tác giả</option>
          <option value="A">Nguyễn Văn A</option>
          <option value="B">Trần Thị B</option>
        </select>
      </div>
    </div>

    <!-- Results -->
    <div>
      <h2 class="mb-6 text-xl font-bold text-gray-900">
        {{ filteredArticles.length > 0 ? `Tìm thấy ${filteredArticles.length} kết quả` : 'Kết quả tìm kiếm' }}
      </h2>

      <div v-if="filteredArticles.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ArticleCard v-for="article in filteredArticles" :key="article.id" :article="article" />
      </div>

      <div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-20 text-center">
        <SearchX class="mb-4 h-16 w-16 text-gray-400" />
        <h3 class="mb-2 text-xl font-bold text-gray-900">Không tìm thấy kết quả</h3>
        <p class="text-gray-500">
          Rất tiếc, chúng tôi không tìm thấy bài viết nào phù hợp với "{{ query }}".<br />
          Vui lòng thử lại với từ khóa khác.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search as SearchIcon, Filter, SearchX } from 'lucide-vue-next'
import { articles, categories } from '@/lib/mock-data'
import ArticleCard from '@/components/ArticleCard.vue'

const route = useRoute()
const router = useRouter()

const searchInput = ref((route.query.q as string) ?? '')
const categoryFilter = ref((route.query.category as string) ?? '')
const query = ref((route.query.q as string) ?? '')

watch(() => route.query, (q) => {
  searchInput.value = (q.q as string) ?? ''
  categoryFilter.value = (q.category as string) ?? ''
  query.value = (q.q as string) ?? ''
})

const filteredArticles = computed(() => {
  return articles.filter(article => {
    const matchesQuery =
      article.title.toLowerCase().includes(query.value.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(query.value.toLowerCase())
    const matchesCategory = categoryFilter.value ? article.category === categoryFilter.value : true
    return matchesQuery && matchesCategory
  })
})

function handleSearch() {
  const params: Record<string, string> = {}
  if (searchInput.value) params.q = searchInput.value
  if (categoryFilter.value) params.category = categoryFilter.value
  router.push({ path: '/search', query: params })
}

function applyFilters() {
  const params: Record<string, string> = {}
  if (query.value) params.q = query.value
  if (categoryFilter.value) params.category = categoryFilter.value
  router.push({ path: '/search', query: params })
}
</script>
