<template>
  <div class="bg-gray-50 min-h-screen pb-16">
    <div v-if="loading" class="flex min-h-[60vh] items-center justify-center text-gray-500">
      Đang tải bài viết của tác giả...
    </div>
    <div v-else>
      <!-- Cover Image -->
      <div class="relative h-64 w-full bg-slate-800">
        <CoverMedia :src="coverImage" alt="Cover" media-class="h-full w-full object-cover opacity-60" />
        <div class="absolute inset-0 pointer-events-none bg-linear-to-t from-gray-900/80 to-transparent" />
      </div>
      <div class="container mx-auto relative z-10 -mt-24 max-w-5xl px-4 lg:px-8">
        <!-- Author Info Card -->
        <div class="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50">
          <div class="mb-6 flex flex-col items-start gap-6 md:-mt-20 md:flex-row md:items-end">
            <img :src="avatarUrl" :alt="authorName" class="h-32 w-32 rounded-full border-4 border-white bg-white object-cover shadow-md" />
            <div class="flex w-full flex-1 flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h1 class="mb-1 text-3xl font-bold text-gray-900">{{ authorName }}</h1>
                <p class="mb-2 text-sm font-medium text-blue-600">Tác giả đang có {{ authorArticles.length }} bài viết xuất bản</p>
              </div>
              <div class="flex w-full gap-3 md:w-auto">
                <RouterLink :to="`/author/${authorId}`" class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 md:flex-none">
                  <UserPlus class="h-4 w-4" />
                  Xem tất cả bài viết
                </RouterLink>
                <button v-if="canShowFollowButton" :disabled="followLoading" @click="toggleFollow" style="z-index:10; pointer-events:auto; position:relative;" class="flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-semibold transition-colors md:flex-none" :class="isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-amber-500 text-white hover:bg-amber-600'">
                  <span v-if="isFollowing">Đã theo dõi</span>
                  <span v-else>Theo dõi tác giả (VIP)</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Author's Articles -->
          <div>
            <div class="mb-6 flex items-center justify-between">
              <h2 class="text-2xl font-bold text-gray-900">Bài viết của {{ authorName }}</h2>
              <span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">{{ authorArticles.length }} bài viết</span>
            </div>
            <div v-if="authorArticles.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ArticleCard v-for="article in authorArticles" :key="article.id" :article="article" />
            </div>
            <div v-else class="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">Tác giả này chưa có bài viết nào.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { UserPlus } from 'lucide-vue-next'

import ArticleCard from '@/components/ArticleCard.vue'
import CoverMedia from '@/components/CoverMedia.vue'

import {
  fetchPublicArticles,
  toArticleCardViewModel,
  type ArticleCardViewModel
} from '@/api/articles'

import { useAuthStore } from '@/stores/auth'

import {
  fetchMySubscriptions,
  subscribeToTarget,
  unsubscribeFromTarget
} from '@/api/subscriptions'

const route = useRoute()

const authorId = computed(() => Number(route.params.id))

const authorArticles = ref<ArticleCardViewModel[]>([])

const loading = ref(true)
const error = ref('')
const authorName = computed(() => authorArticles.value[0]?.authorName || '')

const coverImage = computed(
  () =>
    authorArticles.value[0]?.image ??
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80'
)

const avatarUrl = computed(
  () =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      authorName.value || 'Tac gia'
    )}&background=eff6ff&color=1d4ed8&size=256`
)

const auth = useAuthStore()

const isFollowing = ref(false)
const followLoading = ref(false)

const canShowFollowButton = computed(() => {
  const result =
    auth.isLoggedIn &&
    auth.isVip &&
    authorId.value !== null &&
    auth.userId !== authorId.value
  console.log('[canShowFollowButton]', {
    isLoggedIn: auth.isLoggedIn,
    isVip: auth.isVip,
    authorId: authorId.value,
    userId: auth.userId,
    result
  })
  return result
})

async function loadArticles() {
  loading.value = true
  error.value = ''

  try {
    const articles = await fetchPublicArticles({
      authorId: authorId.value
    })

    authorArticles.value = articles.map(toArticleCardViewModel)

    if (!articles.length) {
      error.value = 'Không tìm thấy bài viết nào của tác giả này.'
    }
  } catch (e) {
    error.value = 'Không thể tải bài viết của tác giả.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('[AuthorProfile] mounted, authorId:', authorId.value)
  loadArticles()
})

watch(
  [authorId, () => auth.isLoggedIn, () => auth.isVip],
  async ([id, loggedIn, vip]) => {
    console.log('[watch] authorId:', id, 'isLoggedIn:', loggedIn, 'isVip:', vip)
    if (!id || !loggedIn || !vip) {
      isFollowing.value = false
      return
    }

    try {
      console.log('[fetchMySubscriptions]')
      const subs = await fetchMySubscriptions()
      console.log('[fetchMySubscriptions] result:', subs)
      isFollowing.value = subs.some(
        s => s.targetType === 'AUTHOR' && s.targetId === id
      )
      console.log('[isFollowing]', isFollowing.value)
    } catch (err) {
      console.log('[fetchMySubscriptions] error', err)
    }
  },
  { immediate: true }
)

async function toggleFollow() {
  if (!authorId.value) {
    console.log('[toggleFollow] Không có authorId')
    return
  }
  console.log('[toggleFollow] Clicked, isFollowing:', isFollowing.value, 'authorId:', authorId.value)
  followLoading.value = true

  try {
    if (isFollowing.value) {
      console.log('[toggleFollow] Unfollow API')
      await unsubscribeFromTarget('AUTHOR', authorId.value)
      isFollowing.value = false
      console.log('[toggleFollow] Unfollowed')
    } else {
      console.log('[toggleFollow] Follow API')
      await subscribeToTarget('AUTHOR', authorId.value)
      isFollowing.value = true
      console.log('[toggleFollow] Followed')
    }
  } catch (err: any) {
    console.log('[toggleFollow] error', err)
    alert(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
  } finally {
    followLoading.value = false
  }
}
</script>
