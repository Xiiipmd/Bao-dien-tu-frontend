<template>
  <div class="bg-[#F7F3ED] min-h-screen pb-16 pt-8">
    <div class="container mx-auto max-w-4xl px-4">
      <!-- Back Link -->
      <button @click="$router.back()" class="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
        <ArrowLeft class="h-4 w-4" /> Quay lại
      </button>

      <!-- Loading Profile State -->
      <div v-if="loadingProfile" class="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 class="h-8 w-8 animate-spin text-amber-600 mb-4" />
        <span>Đang tải thông tin hồ sơ...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p class="mb-4">{{ error }}</p>
        <button @click="loadInitialData" class="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors">
          Thử lại
        </button>
      </div>

      <!-- Main Profile Content -->
      <div v-else-if="profile">
        <!-- Profile Info Card -->
        <div class="mb-8 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs">
          <div class="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 overflow-hidden">
            <img v-if="profile.avatarUrl && profile.avatarUrl.trim() !== ''" :src="profile.avatarUrl" :alt="profile.displayName" class="h-full w-full object-cover" />
            <div v-else :style="{ backgroundColor: getPastelColor(profile.displayName) }" class="flex h-full w-full items-center justify-center font-serif text-3xl font-bold text-gray-900">
              {{ getInitials(profile.displayName) }}
            </div>
          </div>
          <h1 class="mb-2 text-2xl font-serif font-bold text-gray-950">{{ profile.displayName }}</h1>
          <p class="mb-1 text-sm font-medium text-gray-600">{{ mapRoleLabel(profile.role) }}</p>
          <span class="inline-block rounded-full bg-gray-100 px-3.5 py-1 text-xs font-semibold text-gray-500">
            {{ profile.commentCount }} bình luận
          </span>
        </div>

        <!-- Activity Section -->
        <div class="border-t border-gray-200 pt-8">
          <div class="mb-6">
            <span class="text-xs font-bold tracking-widest text-gray-400 uppercase">HOẠT ĐỘNG</span>
            <h2 class="text-xl font-serif font-bold text-gray-900 mt-1">Bình luận gần đây</h2>
          </div>

          <!-- Comments Feed -->
          <div v-if="comments.length > 0" class="space-y-6">
            <div v-for="item in comments" :key="item.commentId" class="rounded-xl border border-gray-200 bg-[#FFFDF9] p-6 shadow-xs">
              <div class="mb-3 flex items-center gap-2 text-xs text-gray-500">
                <span class="font-bold text-amber-700 uppercase tracking-wider">{{ item.article.categoryName || 'Tin tức' }}</span>
                <span>·</span>
                <span>{{ formatDate(item.createdAt) }}</span>
              </div>

              <!-- Comment Content with potential truncation -->
              <p class="text-gray-800 text-sm italic font-serif leading-relaxed">
                “{{ item.content }}”
              </p>

              <!-- Target Article Context -->
              <div class="mt-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
                <span class="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">TRONG BÀI:</span>
                <h3 class="font-serif text-sm font-bold text-gray-900 line-clamp-2">{{ item.article.title }}</h3>
              </div>

              <!-- Action Link -->
              <div class="mt-4">
                <RouterLink :to="`/article/${item.article.id}`" class="inline-flex items-center gap-1 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors">
                  Xem bài báo →
                </RouterLink>
              </div>
            </div>

            <!-- Loading More Loader -->
            <div v-if="loadingComments" class="flex justify-center py-4">
              <Loader2 class="h-5 w-5 animate-spin text-gray-400" />
            </div>

            <!-- Load More CTA -->
            <div v-else-if="hasNext" class="flex justify-center pt-2">
              <button @click="loadMoreComments" class="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Xem thêm bình luận
              </button>
            </div>
            
            <div v-else class="text-center text-xs text-gray-400 pt-4">
              Bạn đã xem hết bình luận.
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500 bg-white">
            <MessageSquare class="h-10 w-10 text-gray-300 mb-3" />
            <h3 class="font-serif font-bold text-gray-800 mb-1">Chưa có bình luận</h3>
            <p class="text-sm text-gray-500">Người dùng này chưa tham gia thảo luận trên The Daily.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-vue-next'
import api from '@/api'

interface PublicUserProfile {
  id: number
  displayName: string
  avatarUrl?: string
  role: string
  commentCount: number
}

interface UserCommentActivity {
  commentId: number
  content: string
  createdAt: string
  article: {
    id: number
    title: string
    categoryName: string
    thumbnailUrl?: string
  }
}

const route = useRoute()
const userId = Number(route.params.id)

const profile = ref<PublicUserProfile | null>(null)
const comments = ref<UserCommentActivity[]>([])
const loadingProfile = ref(true)
const loadingComments = ref(false)
const page = ref(0)
const hasNext = ref(true)
const error = ref('')

const getInitials = (name?: string) => {
  if (!name) return 'U'
  const cleanName = name.trim()
  return cleanName.length > 0 ? cleanName.charAt(0).toUpperCase() : 'U'
}

const getPastelColor = (name?: string) => {
  if (!name) return '#F1EBE4'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const pastelColors = [
    '#F7DED3', // Accent Container
    '#E4EEE7', // Sage Container
    '#E6ECEE', // Blue-gray
    '#F1EBE4', // Surface muted
    '#EADCC9', // Warm clay
    '#DCE3E6', // Cool gray-blue
  ]
  return pastelColors[Math.abs(hash) % pastelColors.length]
}

const mapRoleLabel = (role?: string) => {
  if (!role) return 'Thành viên The Daily'
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return 'Quản trị viên'
    case 'AUTHOR':
      return 'Tác giả'
    case 'CENSOR':
      return 'Kiểm duyệt viên'
    case 'VIP':
      return 'Thành viên VIP'
    case 'MEMBER':
    default:
      return 'Thành viên The Daily'
  }
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function loadInitialData() {
  loadingProfile.value = true
  error.value = ''
  try {
    const [profileRes, commentsRes] = await Promise.all([
      api.get<PublicUserProfile>(`/api/users/${userId}/public-profile`),
      api.get<{ content: UserCommentActivity[], last: boolean }>(`/api/users/${userId}/comments`, {
        params: { page: 0, size: 10 }
      })
    ])

    profile.value = profileRes.data
    comments.value = commentsRes.data.content
    page.value = 0
    hasNext.value = !commentsRes.data.last
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Không thể tải thông tin hồ sơ.'
  } finally {
    loadingProfile.value = false
  }
}

async function loadMoreComments() {
  if (loadingComments.value || !hasNext.value) return
  loadingComments.value = true
  const nextPage = page.value + 1
  try {
    const res = await api.get<{ content: UserCommentActivity[], last: boolean }>(`/api/users/${userId}/comments`, {
      params: { page: nextPage, size: 10 }
    })
    comments.value.push(...res.data.content)
    page.value = nextPage
    hasNext.value = !res.data.last
  } catch (e) {
    console.error('Lỗi tải thêm bình luận:', e)
  } finally {
    loadingComments.value = false
  }
}

onMounted(() => {
  loadInitialData()
})
</script>
