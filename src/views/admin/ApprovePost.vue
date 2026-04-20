<template>
  <div class="flex gap-6 min-h-[600px]">
    <!-- Pending Posts List -->
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
            <span>{{ post.author }}</span>
            <span class="ml-auto">{{ post.date }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Post Detail -->
    <div class="flex-1 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
      <template v-if="selectedPost">
        <div class="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <span class="mb-2 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700 uppercase">{{ selectedPost.category }}</span>
            <h2 class="text-xl font-bold text-gray-900">{{ selectedPost.title }}</h2>
            <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1"><User class="h-4 w-4" />{{ selectedPost.author }}</span>
              <span class="flex items-center gap-1"><Calendar class="h-4 w-4" />{{ selectedPost.date }}</span>
            </div>
          </div>
          <div class="flex gap-3 flex-shrink-0">
            <button @click="handleApprove" class="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors">
              <CheckCircle class="h-4 w-4" /> Duyệt
            </button>
            <button @click="showRejectModal = true" class="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition-colors">
              <XCircle class="h-4 w-4" /> Từ chối
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <img v-if="selectedPost.image" :src="selectedPost.image" :alt="selectedPost.title" class="mb-6 w-full h-64 object-cover rounded-xl" />
          <p class="text-gray-700 leading-relaxed">{{ selectedPost.excerpt }}</p>
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

  <!-- Reject Modal -->
  <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="showRejectModal = false">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
      <h3 class="mb-4 text-lg font-bold text-gray-900">Lý do từ chối</h3>
      <textarea
        v-model="rejectReason"
        rows="4"
        placeholder="Nhập lý do từ chối bài viết này..."
        class="w-full rounded-lg border border-gray-300 p-3 text-gray-700 focus:border-red-500 focus:outline-none resize-none mb-4"
      ></textarea>
      <div class="flex gap-3 justify-end">
        <button @click="showRejectModal = false" class="rounded-lg border border-gray-300 bg-white px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50">Hủy</button>
        <button @click="handleReject" class="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700">Xác nhận từ chối</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { User, Calendar, CheckCircle, XCircle, FileText } from 'lucide-vue-next'
import { articles } from '@/app/lib/mock-data'

const pendingPosts = ref(articles.slice(0, 5).map(a => ({ ...a, status: 'pending' })))
const selectedPostId = ref(pendingPosts.value[0]?.id ?? null)
const selectedPost = computed(() => pendingPosts.value.find(p => p.id === selectedPostId.value))
const showRejectModal = ref(false)
const rejectReason = ref('')

function handleApprove() {
  pendingPosts.value = pendingPosts.value.filter(p => p.id !== selectedPostId.value)
  selectedPostId.value = pendingPosts.value[0]?.id ?? null
}

function handleReject() {
  if (!rejectReason.value.trim()) {
    alert('Vui lòng nhập lý do từ chối.')
    return
  }
  pendingPosts.value = pendingPosts.value.filter(p => p.id !== selectedPostId.value)
  selectedPostId.value = pendingPosts.value[0]?.id ?? null
  showRejectModal.value = false
  rejectReason.value = ''
}
</script>
