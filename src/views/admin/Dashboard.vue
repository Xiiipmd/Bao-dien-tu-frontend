<template>
  <div v-if="loading" class="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">Đang tải dashboard...</div>
  <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{{ error }}</div>
  <div v-else class="space-y-8">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div v-for="(stat, idx) in statCards" :key="idx" class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ stat.title }}</p>
            <h3 class="mt-2 text-3xl font-bold text-gray-900">{{ stat.value }}</h3>
          </div>
          <div :class="['flex h-12 w-12 items-center justify-center rounded-full', stat.bg]">
            <component :is="stat.icon" :class="['h-6 w-6', stat.color]" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <TrendingUp class="mr-1 h-4 w-4 text-emerald-500" />
          <span class="font-medium text-emerald-500">{{ stat.trend }}</span>
          <span class="ml-2 text-gray-500">dựa trên dữ liệu backend hiện tại</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-6 text-lg font-bold text-gray-900">Phân bố trạng thái bài viết</h3>
        <div class="h-80">
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
      </div>
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-6 text-lg font-bold text-gray-900">Lượt xem trên các bài gần đây</h3>
        <div class="h-80">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
      </div>
    </div>

    <div v-if="auth.isAuthor && rejectedArticles.length > 0" class="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900">Bài viết bị từ chối</h3>
          <p class="mt-1 text-sm text-gray-500">Chỉnh sửa theo góp ý của biên tập viên rồi gửi lại duyệt.</p>
        </div>
        <span class="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">{{ rejectedArticles.length }} bài</span>
      </div>
      <div class="space-y-3">
        <div v-for="article in rejectedArticles" :key="article.id" class="rounded-xl border border-red-100 bg-red-50/60 p-4">
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p class="text-base font-semibold text-gray-900">{{ article.title }}</p>
              <p class="mt-1 text-sm text-gray-500">{{ article.categoryName }} • {{ formatDate(article.createdAt) }}</p>
              <p class="mt-3 text-sm text-red-700">{{ article.rejectionReason || 'Bài viết đã bị từ chối và cần chỉnh sửa trước khi gửi lại.' }}</p>
            </div>
            <RouterLink
              :to="`/admin/posts/${article.id}/edit`"
              class="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Chỉnh sửa bài viết
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900">Bài viết gần đây</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-600">
          <thead class="bg-gray-50 text-gray-700">
            <tr>
              <th class="px-6 py-4 font-semibold">Tiêu đề</th>
              <th class="px-6 py-4 font-semibold">Danh mục</th>
              <th class="px-6 py-4 font-semibold">Trạng thái</th>
              <th class="px-6 py-4 font-semibold text-right">Lượt xem</th>
              <th v-if="auth.isAuthor" class="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="article in recentArticles" :key="article.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-medium text-gray-900 max-w-[300px] truncate">{{ article.title }}</td>
              <td class="px-6 py-4 uppercase text-xs font-bold">{{ article.categoryName }}</td>
              <td class="px-6 py-4">
                <span :class="statusBadgeClass(article.status)" class="rounded-full px-2.5 py-0.5 text-xs font-medium">{{ statusLabel(article.status) }}</span>
              </td>
              <td class="px-6 py-4 text-right font-medium">{{ (article.viewCount ?? 0).toLocaleString('vi-VN') }}</td>
              <td v-if="auth.isAuthor" class="px-6 py-4 text-right">
                <RouterLink
                  v-if="article.status === 'REJECTED'"
                  :to="`/admin/posts/${article.id}/edit`"
                  class="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Sửa và gửi lại
                </RouterLink>
                <span v-else class="text-xs text-gray-400">-</span>
              </td>
            </tr>
            <tr v-if="recentArticles.length === 0">
              <td :colspan="auth.isAuthor ? 5 : 4" class="px-6 py-8 text-center text-gray-500">Chưa có dữ liệu bài viết phù hợp để hiển thị.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { FileText, Eye, DollarSign, TrendingUp } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/api/articles'
import { fetchAdminVipPackages, fetchManageableArticles, fetchPendingArticles, fetchVisibilityArticles, type AdminVipPackage, type StaffArticleDto } from '@/api/staff'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const auth = useAuthStore()
const articles = ref<StaffArticleDto[]>([])
const vipPackages = ref<AdminVipPackage[]>([])
const loading = ref(true)
const error = ref('')

onMounted(loadDashboard)

const recentArticles = computed(() => [...articles.value]
  .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  .slice(0, 5))

const rejectedArticles = computed(() => articles.value
  .filter(article => article.status === 'REJECTED')
  .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()))

const statCards = computed(() => {
  const totalArticles = articles.value.length
  const pendingArticles = articles.value.filter(article => article.status === 'PENDING').length
  const visibleArticles = articles.value.filter(article => article.status === 'PUBLISHED').length
  const totalViews = articles.value.reduce((sum, article) => sum + (article.viewCount ?? 0), 0)

  if (auth.isAuthor) {
    return [
      { title: 'Bài viết của tôi', value: totalArticles, icon: FileText, trend: `${visibleArticles} đã xuất bản`, color: 'text-blue-600', bg: 'bg-blue-100' },
      { title: 'Chờ duyệt', value: pendingArticles, icon: Eye, trend: `${Math.max(0, totalArticles - pendingArticles)} đã xử lý`, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      { title: 'Lượt xem', value: totalViews.toLocaleString('vi-VN'), icon: DollarSign, trend: 'từ bài viết hiện có', color: 'text-amber-600', bg: 'bg-amber-100' },
    ]
  }

  return [
    { title: 'Bài viết theo dõi', value: totalArticles, icon: FileText, trend: `${pendingArticles} đang chờ`, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Lượt xem tích lũy', value: totalViews.toLocaleString('vi-VN'), icon: Eye, trend: `${visibleArticles} đang hiển thị`, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: auth.isAdmin ? 'Gói VIP' : 'Bài chờ duyệt', value: auth.isAdmin ? vipPackages.value.length : pendingArticles, icon: DollarSign, trend: auth.isAdmin ? 'đang được cấu hình' : 'cần xử lý', color: 'text-amber-600', bg: 'bg-amber-100' },
  ]
})

const statusEntries = computed(() => {
  const statusOrder = ['PENDING', 'PUBLISHED', 'HIDDEN', 'REJECTED', 'DRAFT'] as const
  return statusOrder.map(status => ({
    label: statusLabel(status),
    value: articles.value.filter(article => article.status === status).length,
  }))
})

const viewEntries = computed(() => {
  const source = recentArticles.value.length > 0 ? recentArticles.value : articles.value.slice(0, 5)
  return source.map(article => ({
    label: article.title.length > 16 ? `${article.title.slice(0, 16)}...` : article.title,
    value: article.viewCount ?? 0,
  }))
})

const barChartData = computed(() => ({
  labels: statusEntries.value.map(entry => entry.label),
  datasets: [{
    label: 'Số lượng bài viết',
    data: statusEntries.value.map(entry => entry.value),
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  }],
}))

const lineChartData = computed(() => ({
  labels: viewEntries.value.map(entry => entry.label),
  datasets: [{
    label: 'Lượt xem',
    data: viewEntries.value.map(entry => entry.value),
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 3,
    tension: 0.4,
    pointRadius: 4,
  }],
}))

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#E5E7EB' } },
  },
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#E5E7EB' } },
  },
}

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try {
    if (auth.isAuthor) {
      articles.value = await fetchManageableArticles()
    } else if (auth.isAdmin) {
      const [pendingArticles, visibilityArticles, vipPackageList] = await Promise.all([
        fetchPendingArticles(),
        fetchVisibilityArticles(),
        fetchAdminVipPackages(),
      ])
      articles.value = dedupeArticles([...pendingArticles, ...visibilityArticles])
      vipPackages.value = vipPackageList
    } else if (auth.isCensor) {
      articles.value = await fetchPendingArticles()
    } else {
      articles.value = []
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải dữ liệu dashboard.'
  } finally {
    loading.value = false
  }
}

function dedupeArticles(list: StaffArticleDto[]) {
  return list.filter((article, index, all) => all.findIndex(candidate => candidate.id === article.id) === index)
}

function statusLabel(status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN') {
  switch (status) {
    case 'PUBLISHED':
      return 'Đã xuất bản'
    case 'PENDING':
      return 'Chờ duyệt'
    case 'REJECTED':
      return 'Từ chối'
    case 'HIDDEN':
      return 'Đã ẩn'
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
