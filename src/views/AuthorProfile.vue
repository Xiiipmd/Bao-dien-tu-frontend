<template>
  <div class="bg-gray-50 min-h-screen pb-16">
    <div v-if="loading" class="flex min-h-[60vh] items-center justify-center text-gray-500">Đang tải bài viết của tác giả...</div>
    <div v-else-if="error" class="container mx-auto max-w-5xl px-4 py-12 lg:px-8">
      <div class="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">{{ error }}</div>
    </div>
    <template v-else>
    <!-- Cover Image -->
    <div class="h-64 w-full bg-slate-800 relative">
      <img :src="coverImage" alt="Cover" class="h-full w-full object-cover opacity-60" />
      <div class="absolute inset-0 bg-linear-to-t from-gray-900/80 to-transparent" />
    </div>

    <div class="container mx-auto px-4 lg:px-8 max-w-5xl -mt-24 relative z-10">
      <!-- Author Info Card -->
      <div class="rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50 mb-10 border border-gray-100">
        <div class="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 mb-6">
          <img
            :src="avatarUrl"
            :alt="authorName"
            class="h-32 w-32 rounded-full border-4 border-white object-cover bg-white shadow-md"
          />
          <div class="flex-1 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-1">{{ authorName }}</h1>
              <p class="text-blue-600 font-medium text-sm mb-2">Tác giả đang có {{ authorArticles.length }} bài viết xuất bản</p>
            </div>
            <div class="flex gap-3 w-full md:w-auto">
              <RouterLink :to="`/search?author=${encodeURIComponent(authorName)}`" class="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700">
                <UserPlus class="h-4 w-4" /> Xem tất cả bài viết
              </RouterLink>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-gray-100">
          <div class="md:col-span-2">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Giới thiệu</h3>
            <p class="text-gray-700 leading-relaxed">{{ bioText }}</p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <Calendar class="h-5 w-5 text-gray-400" />
              <span>Bài mới nhất: <strong class="text-gray-900">{{ latestArticleDate }}</strong></span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <Users class="h-5 w-5 text-gray-400" />
              <span><strong class="text-gray-900">{{ authorArticles.length }}</strong> Bài viết đã xuất bản</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <UserPlus class="h-5 w-5 text-gray-400" />
              <span>Phủ <strong class="text-gray-900">{{ coveredCategories }}</strong> chuyên mục</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Author's Articles -->
      <div>
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Bài viết của {{ authorName }}</h2>
          <span class="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{{ authorArticles.length }} bài viết</span>
        </div>

        <div v-if="authorArticles.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ArticleCard v-for="article in authorArticles" :key="article.id" :article="article" />
        </div>
        <div v-else class="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          Tác giả này chưa có bài viết nào.
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UserPlus, Users, Calendar } from 'lucide-vue-next'
import ArticleCard from '@/components/ArticleCard.vue'
import { fetchPublicArticles, formatDate, toArticleCardViewModel, type ArticleCardViewModel } from '@/api/articles'

const route = useRoute()
const authorName = computed(() => decodeURIComponent(route.params.id as string))
const authorArticles = ref<ArticleCardViewModel[]>([])
const loading = ref(true)
const error = ref('')

const coverImage = computed(() => authorArticles.value[0]?.image ?? 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80')
const avatarUrl = computed(() => `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName.value || 'Tac gia')}&background=eff6ff&color=1d4ed8&size=256`)
const latestArticleDate = computed(() => authorArticles.value[0]?.createdAt ?? 'Chưa xác định')
const coveredCategories = computed(() => new Set(authorArticles.value.map(article => article.category)).size)
const bioText = computed(() => {
  if (!authorArticles.value.length) {
    return 'Hiện chưa có bài viết xuất bản của tác giả này trên hệ thống.'
  }

  const vipArticles = authorArticles.value.filter(article => article.isVip).length
  return `${authorName.value} hiện có ${authorArticles.value.length} bài viết đang xuất bản, trong đó ${vipArticles} bài thuộc nhóm nội dung VIP. Nội dung của tác giả trải dài trên ${coveredCategories.value} chuyên mục.`
})

watch(authorName, async () => {
  await loadAuthorArticles()
}, { immediate: true })

async function loadAuthorArticles() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetchPublicArticles({ authorName: authorName.value })
    authorArticles.value = response.map(toArticleCardViewModel)
    if (!authorArticles.value.length) {
      error.value = 'Không tìm thấy bài viết nào của tác giả này.'
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải bài viết của tác giả. Vui lòng thử lại.'
    authorArticles.value = []
  } finally {
    loading.value = false
  }
}
</script>
