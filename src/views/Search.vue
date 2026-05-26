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
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>

        <select v-model="authorFilter" @change="applyFilters" class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none">
          <option value="">Tất cả tác giả</option>
          <option v-for="author in authors" :key="author" :value="author">{{ author }}</option>
        </select>
      </div>

      <div class="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wide text-blue-700">Nhận bài mới qua email</h3>
            <p class="mt-2 text-sm leading-6 text-gray-700">
              <template v-if="selectedCategoryOption">
                Theo dõi chuyên mục <strong class="text-gray-900">{{ selectedCategoryOption.name }}</strong> để nhận email khi có bài mới được xuất bản.
              </template>
              <template v-else>
                Chọn một chuyên mục để bật thông báo email cho bài viết mới của chuyên mục đó.
              </template>
            </p>
          </div>

          <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              v-if="canManageSubscriptions && selectedCategoryOption"
              type="button"
              @click="toggleCategorySubscription"
              :disabled="subscriptionLoading"
              :class="[
                'rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                selectedCategorySubscription ? 'border border-blue-300 bg-white text-blue-700 hover:bg-blue-100' : 'bg-blue-600 text-white hover:bg-blue-700',
              ]"
            >
              {{ subscriptionLoading
                ? 'Đang cập nhật...'
                : selectedCategorySubscription
                  ? 'Hủy theo dõi chuyên mục'
                  : 'Theo dõi chuyên mục' }}
            </button>

            <RouterLink
              v-else-if="!auth.isLoggedIn"
              to="/login"
              class="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Đăng nhập để theo dõi
            </RouterLink>

            <RouterLink
              v-else-if="!auth.isVip"
              to="/vip"
              class="rounded-lg bg-amber-500 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              Nâng cấp VIP
            </RouterLink>

            <button
              v-else
              type="button"
              disabled
              class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-500"
            >
              Chọn chuyên mục trước
            </button>
          </div>
        </div>

        <p v-if="!auth.isLoggedIn" class="mt-3 text-sm text-gray-600">
          Tính năng gửi email bài mới chỉ khả dụng sau khi đăng nhập và áp dụng cho tài khoản VIP.
        </p>
        <p v-else-if="!auth.isVip" class="mt-3 text-sm text-amber-700">
          Yêu cầu đăng ký VIP để sử dụng.
        </p>
        <p v-else-if="selectedCategorySubscription" class="mt-3 text-sm text-emerald-700">
          Bạn đang theo dõi chuyên mục này và sẽ nhận email khi có bài mới được duyệt xuất bản.
        </p>
        <p v-if="subscriptionError" class="mt-3 text-sm text-red-600">{{ subscriptionError }}</p>
        <p v-if="subscriptionSuccess" class="mt-3 text-sm text-emerald-700">{{ subscriptionSuccess }}</p>
      </div>
    </div>

    <!-- Results -->
    <div>
      <div v-if="loading" class="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-500">Đang tìm kiếm bài viết...</div>
      <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{{ error }}</div>
      <template v-else>
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
          Rất tiếc, chúng tôi không tìm thấy bài viết nào phù hợp với "{{ queryLabel }}".<br />
          Vui lòng thử lại với từ khóa khác.
        </p>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Search as SearchIcon, Filter, SearchX } from 'lucide-vue-next'
import ArticleCard from '@/components/ArticleCard.vue'
import {
  fetchCategories,
  fetchPublicArticles,
  toArticleCardViewModel,
  type ArticleCardViewModel,
  type ArticleSearchResponse,
  type CategoryOption,
} from '@/api/articles'
import {
  fetchMySubscriptions,
  subscribeToTarget,
  unsubscribeFromTarget,
  type SubscriptionResponse,
} from '@/api/subscriptions'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const searchInput = ref((route.query.q as string) ?? '')
const categoryFilter = ref((route.query.category as string) ?? '')
const authorFilter = ref((route.query.author as string) ?? '')
const query = ref((route.query.q as string) ?? '')
const allArticles = ref<ArticleSearchResponse[]>([])
const categoryOptions = ref<CategoryOption[]>([])
const searchResults = ref<ArticleSearchResponse[]>([])
const subscriptions = ref<SubscriptionResponse[]>([])
const loading = ref(false)
const error = ref('')
const subscriptionLoading = ref(false)
const subscriptionError = ref('')
const subscriptionSuccess = ref('')

watch(() => route.query, async (q) => {
  searchInput.value = (q.q as string) ?? ''
  categoryFilter.value = (q.category as string) ?? ''
  authorFilter.value = (q.author as string) ?? ''
  query.value = (q.q as string) ?? ''
  await loadSearchResults()
}, { immediate: true })

watch([() => auth.isLoggedIn, () => auth.isVip], async () => {
  await loadSubscriptions()
}, { immediate: true })

watch(categoryFilter, () => {
  subscriptionError.value = ''
  subscriptionSuccess.value = ''
})

onMounted(async () => {
  await Promise.all([
    loadFilterOptions(),
    loadSubscriptions(),
  ])
})

const filteredArticles = computed(() => {
  return searchResults.value
    .filter(article => !categoryFilter.value || article.categoryName === categoryFilter.value)
    .map(toArticleCardViewModel)
})

const categories = computed(() => {
  if (categoryOptions.value.length) {
    return categoryOptions.value.map(category => category.name)
  }

  return [...new Set(allArticles.value.map(article => article.categoryName))]
})
const authors = computed(() => [...new Set(allArticles.value.map(article => article.authorName))])
const queryLabel = computed(() => query.value || authorFilter.value || categoryFilter.value || 'tiêu chí đã chọn')
const canManageSubscriptions = computed(() => auth.isLoggedIn && auth.isVip)
const selectedCategoryOption = computed(() => {
  if (!categoryFilter.value) {
    return null
  }

  return categoryOptions.value.find(category => category.name === categoryFilter.value) ?? null
})
const selectedCategorySubscription = computed(() => {
  if (!selectedCategoryOption.value) {
    return null
  }

  return subscriptions.value.find(subscription => (
    subscription.targetType === 'CATEGORY'
    && subscription.targetId === selectedCategoryOption.value?.id
  )) ?? null
})

function handleSearch() {
  const params: Record<string, string> = {}
  if (searchInput.value) params.q = searchInput.value
  if (categoryFilter.value) params.category = categoryFilter.value
  if (authorFilter.value) params.author = authorFilter.value
  router.push({ path: '/search', query: params })
}

function applyFilters() {
  const params: Record<string, string> = {}
  if (query.value) params.q = query.value
  if (categoryFilter.value) params.category = categoryFilter.value
  if (authorFilter.value) params.author = authorFilter.value
  router.push({ path: '/search', query: params })
}

async function loadFilterOptions() {
  try {
    const [articles, categories] = await Promise.all([
      fetchPublicArticles(),
      fetchCategories(),
    ])
    allArticles.value = articles
    categoryOptions.value = categories
  } catch {
    allArticles.value = []
    categoryOptions.value = []
  }
}

async function loadSearchResults() {
  loading.value = true
  error.value = ''
  try {
    searchResults.value = await fetchPublicArticles({
      keyword: query.value || undefined,
      authorName: authorFilter.value || undefined,
    })
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải kết quả tìm kiếm. Vui lòng thử lại.'
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

async function loadSubscriptions() {
  subscriptionError.value = ''

  if (!auth.isLoggedIn || !auth.isVip) {
    subscriptions.value = []
    return
  }

  try {
    subscriptions.value = await fetchMySubscriptions()
  } catch (err: any) {
    subscriptionError.value = err?.response?.data?.message ?? 'Không thể tải danh sách đăng ký nhận email.'
    subscriptions.value = []
  }
}

async function toggleCategorySubscription() {
  if (!selectedCategoryOption.value) {
    subscriptionError.value = 'Vui lòng chọn chuyên mục trước khi theo dõi.'
    return
  }

  subscriptionLoading.value = true
  subscriptionError.value = ''
  subscriptionSuccess.value = ''

  try {
    if (selectedCategorySubscription.value) {
      await unsubscribeFromTarget('CATEGORY', selectedCategoryOption.value.id)
      subscriptions.value = subscriptions.value.filter(subscription => subscription.id !== selectedCategorySubscription.value?.id)
      subscriptionSuccess.value = `Đã hủy theo dõi chuyên mục ${selectedCategoryOption.value.name}.`
      return
    }

    const subscription = await subscribeToTarget('CATEGORY', selectedCategoryOption.value.id)
    subscriptions.value = [subscription, ...subscriptions.value.filter(item => item.id !== subscription.id)]
    subscriptionSuccess.value = `Đã bật nhận email cho chuyên mục ${selectedCategoryOption.value.name}.`
  } catch (err: any) {
    subscriptionError.value = err?.response?.data?.message ?? 'Không thể cập nhật đăng ký nhận email cho chuyên mục này.'
  } finally {
    subscriptionLoading.value = false
  }
}
</script>
