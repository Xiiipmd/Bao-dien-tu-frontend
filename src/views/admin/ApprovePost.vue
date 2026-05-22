<template>
  <div v-if="loading" class="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">Đang tải danh sách chờ duyệt...</div>
  <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{{ error }}</div>
  <div v-else class="flex min-h-[600px] gap-6">
    <div class="w-1/3 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-bold text-gray-900">Chờ duyệt</h3>
        <span class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">{{ pendingPosts.length }}</span>
      </div>
      <div class="flex-1 overflow-y-auto divide-y divide-gray-100">
        <button
          v-for="post in pendingPosts"
          :key="post.id"
          @click="selectedPostId = post.id"
          :class="['w-full text-left p-4 hover:bg-blue-50 transition-colors', selectedPostId === post.id ? 'bg-blue-50 border-l-4 border-blue-500' : '']"
        >
          <p class="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{{ post.title }}</p>
          <div class="flex items-center gap-2 text-xs text-gray-500">
            <User class="h-3 w-3" />
            <span>{{ post.authorName }}</span>
            <span class="ml-auto">{{ formatDate(post.createdAt) }}</span>
          </div>
        </button>
        <div v-if="pendingPosts.length === 0" class="p-6 text-sm text-gray-500">Không còn bài viết nào đang chờ duyệt.</div>
      </div>
    </div>

    <div class="flex-1 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
      <template v-if="selectedPost">
        <div class="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <span class="mb-2 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700 uppercase">{{ selectedPost.categoryName }}</span>
            <h2 class="text-xl font-bold text-gray-900">{{ selectedPost.title }}</h2>
            <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1"><User class="h-4 w-4" />{{ selectedPost.authorName }}</span>
              <span class="flex items-center gap-1"><Calendar class="h-4 w-4" />{{ formatDate(selectedPost.createdAt) }}</span>
            </div>
          </div>
          <div class="flex gap-3 flex-shrink-0">
            <button :disabled="actionLoading" @click="handleApprove" class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-60">
              <CheckCircle class="h-4 w-4" /> Duyệt
            </button>
            <button :disabled="actionLoading" @click="showRejectModal = true" class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-60">
              <XCircle class="h-4 w-4" /> Từ chối
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <img v-if="selectedPost.coverImage" :src="selectedPost.coverImage" :alt="selectedPost.title" class="mb-6 w-full h-64 object-cover rounded-xl" />
          <p class="mb-4 text-sm font-medium text-gray-500">{{ selectedPost.sapo }}</p>
          <div class="prose max-w-none text-gray-700" v-html="selectedPost.content"></div>
        </div>
      </template>
      <div v-else class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <FileText class="mx-auto h-12 w-12 mb-3" />
          <p>Chọn một bài viết để xem</p>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showRejectModal = false">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
      <h3 class="mb-4 text-lg font-bold text-gray-900">Lý do từ chối</h3>
      <textarea
        v-model="rejectReason"
        rows="4"
        placeholder="Nhập lý do từ chối bài viết này..."
        class="w-full rounded-lg border border-gray-300 p-3 text-gray-700 focus:border-red-500 focus:outline-none resize-none mb-4"
      ></textarea>
      <p v-if="actionError" class="mb-4 text-sm text-red-600">{{ actionError }}</p>
      <div class="flex gap-3 justify-end">
        <button @click="showRejectModal = false" class="rounded-lg border border-gray-300 bg-white px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50">Hủy</button>
        <button :disabled="actionLoading" @click="handleReject" class="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60">Xác nhận từ chối</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { User, Calendar, CheckCircle, XCircle, FileText } from 'lucide-vue-next'
import { formatDate } from '@/api/articles'
import { fetchPendingArticleDetail, fetchPendingArticles, moderateArticle, type StaffArticleDto } from '@/api/staff'

const pendingPosts = ref<StaffArticleDto[]>([])
const selectedPostId = ref<number | null>(null)
const selectedPost = ref<StaffArticleDto | null>(null)
const showRejectModal = ref(false)
const rejectReason = ref('')
const loading = ref(true)
const error = ref('')
const actionLoading = ref(false)
const actionError = ref('')

onMounted(loadPendingPosts)

watch(selectedPostId, async (articleId) => {
  if (!articleId) {
    selectedPost.value = null
    return
  }

  try {
    selectedPost.value = await fetchPendingArticleDetail(articleId)
  } catch (err: any) {
    actionError.value = err?.response?.data?.message ?? 'Không thể tải chi tiết bài viết.'
  }
})

async function loadPendingPosts() {
  loading.value = true
  error.value = ''
  try {
    pendingPosts.value = await fetchPendingArticles()
    selectedPostId.value = pendingPosts.value[0]?.id ?? null
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải danh sách chờ duyệt.'
  } finally {
    loading.value = false
  }
}

async function handleApprove() {
  await submitDecision({ approved: true })
}

async function handleReject() {
  if (!rejectReason.value.trim()) {
    actionError.value = 'Vui lòng nhập lý do từ chối.'
    return
  }

  await submitDecision({ approved: false, rejectionReason: rejectReason.value.trim() })
}

async function submitDecision(payload: { approved: boolean; rejectionReason?: string }) {
  if (!selectedPostId.value) {
    return
  }

  actionLoading.value = true
  actionError.value = ''
  try {
    await moderateArticle(selectedPostId.value, payload)
    pendingPosts.value = pendingPosts.value.filter(post => post.id !== selectedPostId.value)
    selectedPostId.value = pendingPosts.value[0]?.id ?? null
    selectedPost.value = null
    showRejectModal.value = false
    rejectReason.value = ''
  } catch (err: any) {
    actionError.value = err?.response?.data?.message ?? 'Không thể cập nhật quyết định duyệt bài.'
  } finally {
    actionLoading.value = false
  }
}
</script>
