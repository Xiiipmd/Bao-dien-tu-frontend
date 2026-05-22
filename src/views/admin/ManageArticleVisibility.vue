<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Ẩn / Hiện bài viết</h2>
          <p class="mt-1 text-sm text-gray-500">Quản lý các bài đã xuất bản hoặc đang bị ẩn bằng endpoint moderation hiện tại.</p>
        </div>
        <form @submit.prevent="loadVisibilityArticles" class="flex items-center gap-3">
          <input
            v-model="keyword"
            type="text"
            placeholder="Tìm theo tiêu đề hoặc mã bài"
            class="w-72 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button class="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Tìm kiếm</button>
        </form>
      </div>
    </div>

    <div v-if="loading" class="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">Đang tải danh sách hiển thị...</div>
    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{{ error }}</div>
    <div v-else class="flex min-h-[600px] gap-6">
      <div class="w-1/3 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 class="font-bold text-gray-900">Bài viết</h3>
          <span class="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">{{ articles.length }}</span>
        </div>
        <div class="divide-y divide-gray-100">
          <button
            v-for="article in articles"
            :key="article.id"
            @click="selectedArticleId = article.id"
            :class="['w-full p-4 text-left transition-colors hover:bg-blue-50', selectedArticleId === article.id ? 'border-l-4 border-blue-500 bg-blue-50' : '']"
          >
            <div class="mb-2 flex items-center justify-between gap-2">
              <p class="line-clamp-2 text-sm font-semibold text-gray-900">{{ article.title }}</p>
              <span :class="statusBadgeClass(article.status)" class="rounded-full px-2 py-0.5 text-[11px] font-semibold">{{ statusLabel(article.status) }}</span>
            </div>
            <div class="text-xs text-gray-500">
              <span>{{ article.authorName }}</span>
              <span class="ml-2">{{ formatDate(article.createdAt) }}</span>
            </div>
          </button>
          <div v-if="articles.length === 0" class="p-6 text-sm text-gray-500">Không có bài viết nào phù hợp với bộ lọc hiện tại.</div>
        </div>
      </div>

      <div class="flex-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <template v-if="selectedArticle">
          <div class="flex items-start justify-between gap-4 border-b border-gray-100 p-6">
            <div>
              <span class="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700">{{ selectedArticle.categoryName }}</span>
              <h3 class="text-xl font-bold text-gray-900">{{ selectedArticle.title }}</h3>
              <p class="mt-2 text-sm text-gray-500">{{ selectedArticle.authorName }} • {{ formatDate(selectedArticle.createdAt) }}</p>
            </div>
            <button
              :disabled="actionLoading"
              @click="toggleVisibility"
              :class="selectedArticle.status === 'HIDDEN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'"
              class="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {{ actionLoading ? 'Đang xử lý...' : (selectedArticle.status === 'HIDDEN' ? 'Hiển thị lại' : 'Ẩn bài viết') }}
            </button>
          </div>
          <div class="p-6">
            <img v-if="selectedArticle.coverImage" :src="selectedArticle.coverImage" :alt="selectedArticle.title" class="mb-6 h-64 w-full rounded-xl object-cover" />
            <p class="mb-4 text-sm font-medium text-gray-500">{{ selectedArticle.sapo }}</p>
            <div class="prose max-w-none text-gray-700" v-html="selectedArticle.content"></div>
          </div>
        </template>
        <div v-else class="flex h-full items-center justify-center text-gray-400">Chọn một bài viết để xem chi tiết.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { formatDate } from '@/api/articles'
import { fetchVisibilityArticleDetail, fetchVisibilityArticles, hideArticle, showArticle, type StaffArticleDto } from '@/api/staff'

const keyword = ref('')
const articles = ref<StaffArticleDto[]>([])
const selectedArticleId = ref<number | null>(null)
const selectedArticle = ref<StaffArticleDto | null>(null)
const loading = ref(true)
const error = ref('')
const actionLoading = ref(false)

onMounted(loadVisibilityArticles)

watch(selectedArticleId, async (articleId) => {
  if (!articleId) {
    selectedArticle.value = null
    return
  }

  try {
    selectedArticle.value = await fetchVisibilityArticleDetail(articleId)
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải chi tiết bài viết.'
  }
})

async function loadVisibilityArticles() {
  loading.value = true
  error.value = ''
  try {
    articles.value = await fetchVisibilityArticles(keyword.value)
    selectedArticleId.value = articles.value[0]?.id ?? null
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải danh sách hiển thị bài viết.'
  } finally {
    loading.value = false
  }
}

async function toggleVisibility() {
  if (!selectedArticle.value) {
    return
  }

  actionLoading.value = true
  error.value = ''
  try {
    const updatedArticle = selectedArticle.value.status === 'HIDDEN'
      ? await showArticle(selectedArticle.value.id)
      : await hideArticle(selectedArticle.value.id)

    const targetIndex = articles.value.findIndex(article => article.id === updatedArticle.id)
    if (targetIndex !== -1) {
      articles.value[targetIndex] = updatedArticle
    }
    selectedArticle.value = updatedArticle
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể cập nhật trạng thái hiển thị của bài viết.'
  } finally {
    actionLoading.value = false
  }
}

function statusLabel(status: StaffArticleDto['status']) {
  return status === 'HIDDEN' ? 'Đã ẩn' : 'Đang hiển thị'
}

function statusBadgeClass(status: StaffArticleDto['status']) {
  return status === 'HIDDEN'
    ? 'bg-slate-200 text-slate-700'
    : 'bg-emerald-100 text-emerald-700'
}
</script>