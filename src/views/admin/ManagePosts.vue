<template>
  <div class="space-y-6">
    <section class="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Tác giả</span>
          <h2 class="mt-3 text-2xl font-bold tracking-tight text-gray-900">Quản lý bài viết</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Tìm kiếm bài viết theo tiêu đề, xem trạng thái xử lý và mở form chỉnh sửa cho những bài còn được phép cập nhật.
          </p>
        </div>

        <RouterLink
          to="/admin/posts/create"
          class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Viết bài mới
        </RouterLink>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-4">
        <div class="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Tổng bài</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">{{ articles.length }}</p>
        </div>
        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">Chờ duyệt</p>
          <p class="mt-2 text-2xl font-bold text-amber-900">{{ pendingCount }}</p>
        </div>
        <div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-red-700">Bị từ chối</p>
          <p class="mt-2 text-2xl font-bold text-red-900">{{ rejectedCount }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-700">Bị khóa / ẩn</p>
          <p class="mt-2 text-2xl font-bold text-slate-900">{{ hiddenCount }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form class="flex w-full max-w-2xl gap-3" @submit.prevent="handleSearch">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Tìm theo tiêu đề bài viết..."
            class="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            :disabled="loading"
            class="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {{ loading ? 'Đang tải...' : 'Tìm kiếm' }}
          </button>
        </form>

        <button
          type="button"
          @click="clearSearch"
          :disabled="loading && !searchKeyword"
          class="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Xóa bộ lọc
        </button>
      </div>

      <div v-if="flashMessage" class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ flashMessage }}
      </div>
      <div v-if="error" class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div v-if="loading" class="mt-6 space-y-3">
        <div v-for="placeholder in 4" :key="placeholder" class="animate-pulse rounded-2xl border border-gray-100 p-4">
          <div class="h-4 w-1/3 rounded bg-gray-200"></div>
          <div class="mt-3 h-3 rounded bg-gray-100"></div>
          <div class="mt-2 h-3 w-2/3 rounded bg-gray-100"></div>
        </div>
      </div>

      <div v-else-if="articles.length === 0" class="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
        Không tìm thấy bài viết nào phù hợp với điều kiện hiện tại.
      </div>

      <div v-else class="mt-6 overflow-hidden rounded-2xl border border-gray-100">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-gray-50 text-gray-700">
              <tr>
                <th class="px-6 py-4 font-semibold">Tiêu đề</th>
                <th class="px-6 py-4 font-semibold">Danh mục</th>
                <th class="px-6 py-4 font-semibold">Trạng thái</th>
                <th class="px-6 py-4 font-semibold">Cập nhật</th>
                <th class="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="article in articles" :key="article.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 align-top">
                  <p class="font-semibold text-gray-900">{{ article.title }}</p>
                  <p v-if="article.rejectionReason" class="mt-2 max-w-xl text-xs leading-5 text-red-700">
                    Lý do từ chối: {{ article.rejectionReason }}
                  </p>
                </td>
                <td class="px-6 py-4 align-top text-xs font-bold uppercase">{{ article.categoryName }}</td>
                <td class="px-6 py-4 align-top">
                  <span :class="statusBadgeClass(article.status)" class="rounded-full px-2.5 py-1 text-xs font-semibold">
                    {{ statusLabel(article.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 align-top text-sm text-gray-500">{{ formatDate(article.createdAt) }}</td>
                <td class="px-6 py-4 align-top text-right">
                  <RouterLink
                    v-if="article.status !== 'HIDDEN'"
                    :to="`/admin/posts/${article.id}/edit`"
                    class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Chỉnh sửa
                  </RouterLink>
                  <span v-else class="text-xs font-medium text-slate-500">
                    Không thể sửa do đã bị khóa/gỡ bỏ
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { formatDate } from '@/api/articles'
import { fetchManageableArticles, type StaffArticleDto } from '@/api/staff'

const route = useRoute()
const router = useRouter()

const articles = ref<StaffArticleDto[]>([])
const loading = ref(false)
const error = ref('')
const searchKeyword = ref((route.query.q as string) ?? '')
const flashMessage = ref('')

const pendingCount = computed(() => articles.value.filter(article => article.status === 'PENDING').length)
const rejectedCount = computed(() => articles.value.filter(article => article.status === 'REJECTED').length)
const hiddenCount = computed(() => articles.value.filter(article => article.status === 'HIDDEN').length)

watch(() => route.query, async query => {
  searchKeyword.value = (query.q as string) ?? ''
  flashMessage.value = query.updated === '1'
    ? 'Cập nhật bài viết thành công.'
    : query.cancelled === '1'
      ? 'Đã hủy chỉnh sửa. Nội dung bài viết được giữ nguyên.'
      : ''
  await loadArticles(searchKeyword.value)
}, { immediate: true })

onMounted(() => {
  flashMessage.value = route.query.updated === '1'
    ? 'Cập nhật bài viết thành công.'
    : route.query.cancelled === '1'
      ? 'Đã hủy chỉnh sửa. Nội dung bài viết được giữ nguyên.'
      : ''
})

async function loadArticles(keyword?: string) {
  loading.value = true
  error.value = ''

  try {
    articles.value = await fetchManageableArticles(keyword)
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải danh sách bài viết để quản lý.'
    articles.value = []
  } finally {
    loading.value = false
  }
}

async function handleSearch() {
  await router.push({
    path: '/admin/posts/manage',
    query: searchKeyword.value.trim() ? { q: searchKeyword.value.trim() } : undefined,
  })
}

async function clearSearch() {
  searchKeyword.value = ''
  await router.push({ path: '/admin/posts/manage' })
}

function statusLabel(status: StaffArticleDto['status']) {
  switch (status) {
    case 'PUBLISHED':
      return 'Đã xuất bản'
    case 'PENDING':
      return 'Chờ duyệt'
    case 'REJECTED':
      return 'Bị từ chối'
    case 'HIDDEN':
      return 'Đã khóa / gỡ bỏ'
    default:
      return 'Bản nháp'
  }
}

function statusBadgeClass(status: StaffArticleDto['status']) {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-emerald-100 text-emerald-700'
    case 'PENDING':
      return 'bg-amber-100 text-amber-700'
    case 'REJECTED':
      return 'bg-red-100 text-red-700'
    case 'HIDDEN':
      return 'bg-slate-200 text-slate-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
</script>