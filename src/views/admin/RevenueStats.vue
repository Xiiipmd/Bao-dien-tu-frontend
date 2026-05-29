<template>
  <div class="space-y-6">
    <section class="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <span class="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase text-sky-700">Tác giả</span>
          <h2 class="mt-3 text-2xl font-bold text-gray-900">Thống kê bài viết & doanh thu</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Theo dõi số bài, lượt xem, lượng follow và doanh thu theo từng chủ đề trong khoảng thời gian đã chọn.
          </p>
        </div>

        <form class="grid gap-3 sm:grid-cols-2 xl:grid-cols-[160px_160px_150px_auto]" @submit.prevent="handleSubmit">
          <label class="text-sm font-medium text-gray-700">
            <span class="mb-2 block">Từ ngày</span>
            <input
              v-model="startDateInput"
              type="date"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label class="text-sm font-medium text-gray-700">
            <span class="mb-2 block">Đến ngày</span>
            <input
              v-model="endDateInput"
              type="date"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label class="text-sm font-medium text-gray-700">
            <span class="mb-2 block">Nhóm theo</span>
            <select
              v-model="groupByInput"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option v-for="option in groupOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="flex items-end gap-3">
            <button
              type="submit"
              :disabled="loading"
              class="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {{ loading ? 'Đang tải...' : 'Xem thống kê' }}
            </button>
          </div>
        </form>
      </div>

      <div class="mt-5 flex flex-wrap gap-3 text-xs text-gray-500">
        <span class="rounded-full bg-gray-100 px-3 py-1">Mặc định: tháng hiện tại</span>
        <span class="rounded-full bg-gray-100 px-3 py-1">Bài thường: {{ formatPlainCurrency(priceInfo.free) }}/view</span>
        <span class="rounded-full bg-gray-100 px-3 py-1">Bài VIP: {{ formatPlainCurrency(priceInfo.vip) }}/view</span>
        <span class="rounded-full bg-gray-100 px-3 py-1">Follow chỉ dùng để thống kê và gửi mail bài mới</span>
      </div>

      <div v-if="dateError" class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ dateError }}
      </div>
      <div v-if="error" class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>
    </section>

    <div v-if="loading" class="space-y-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="placeholder in 4" :key="placeholder" class="animate-pulse rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div class="h-4 w-1/3 rounded bg-gray-200"></div>
          <div class="mt-4 h-8 w-1/2 rounded bg-gray-100"></div>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="h-96 animate-pulse rounded-3xl border border-gray-100 bg-white shadow-sm"></div>
        <div class="h-96 animate-pulse rounded-3xl border border-gray-100 bg-white shadow-sm"></div>
      </div>
    </div>

    <template v-else-if="stats">
      <section class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="card in summaryCards" :key="card.title" class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500">{{ card.title }}</p>
              <h3 class="mt-3 text-3xl font-bold text-gray-900">{{ card.value }}</h3>
            </div>
            <div :class="['flex h-12 w-12 shrink-0 items-center justify-center rounded-full', card.bg]">
              <component :is="card.icon" :class="['h-6 w-6', card.color]" />
            </div>
          </div>
          <p class="mt-4 text-sm text-gray-500">{{ card.caption }}</p>
        </div>
      </section>

      <div v-if="noData" class="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
        Không có dữ liệu thống kê trong khoảng thời gian đã chọn. Bạn có thể chọn lại khoảng thời gian khác.
      </div>

      <template v-else>
        <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div class="mb-6">
              <h3 class="text-lg font-bold text-gray-900">Lượt xem theo {{ periodLabel }}</h3>
              <p class="mt-1 text-sm text-gray-500">Gồm toàn bộ lượt đọc của bài thường và bài VIP.</p>
            </div>
            <div class="h-80">
              <Bar :data="viewsChartData" :options="barChartOptions" />
            </div>
          </div>

          <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div class="mb-6">
              <h3 class="text-lg font-bold text-gray-900">Doanh thu theo {{ periodLabel }}</h3>
              <p class="mt-1 text-sm text-gray-500">Tính theo {{ formatPlainCurrency(priceInfo.free) }}/view thường và {{ formatPlainCurrency(priceInfo.vip) }}/view VIP.</p>
            </div>
            <div class="h-80">
              <Line :data="revenueChartData" :options="lineChartOptions" />
            </div>
          </div>
        </section>

        <section class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div class="border-b border-gray-100 px-6 py-5">
            <h3 class="text-lg font-bold text-gray-900">Doanh thu theo chủ đề</h3>
            <p class="mt-1 text-sm text-gray-500">Follow chủ đề chỉ là số liệu theo dõi, không cộng vào doanh thu.</p>
          </div>

          <div v-if="topicStats.length === 0" class="px-6 py-10 text-center text-sm text-gray-500">
            Không có chủ đề nào phát sinh dữ liệu trong khoảng thời gian này.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-gray-700">
                <tr>
                  <th class="px-6 py-4 font-semibold">Chủ đề</th>
                  <th class="px-6 py-4 font-semibold text-right">Số bài</th>
                  <th class="px-6 py-4 font-semibold text-right">Follow</th>
                  <th class="px-6 py-4 font-semibold text-right">Lượt xem</th>
                  <th class="px-6 py-4 font-semibold text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="topic in topicStats" :key="topic.categoryId" class="hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium text-gray-900">{{ topic.categoryName }}</td>
                  <td class="px-6 py-4 text-right">{{ formatNumber(topic.articles) }}</td>
                  <td class="px-6 py-4 text-right">{{ formatNumber(topic.followers) }}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="font-semibold text-gray-900">{{ formatNumber(topic.views) }}</div>
                    <div class="mt-1 text-xs text-gray-500">
                      Thường {{ formatNumber(topic.freeViews) }} · VIP {{ formatNumber(topic.vipViews) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ formatCurrency(topic.revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div class="border-b border-gray-100 px-6 py-5">
            <h3 class="text-lg font-bold text-gray-900">Top bài viết theo lượt xem</h3>
            <p class="mt-1 text-sm text-gray-500">Hiển thị tối đa 5 bài được xem nhiều nhất trong khoảng thời gian đã chọn.</p>
          </div>

          <div v-if="stats.topArticles.length === 0" class="px-6 py-10 text-center text-sm text-gray-500">
            Không có bài viết nổi bật trong khoảng thời gian này.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-gray-700">
                <tr>
                  <th class="px-6 py-4 font-semibold">Tiêu đề</th>
                  <th class="px-6 py-4 font-semibold">Loại</th>
                  <th class="px-6 py-4 font-semibold">Ngày xuất bản</th>
                  <th class="px-6 py-4 font-semibold text-right">Lượt xem</th>
                  <th class="px-6 py-4 font-semibold text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr v-for="article in stats.topArticles" :key="article.articleId" class="hover:bg-gray-50">
                  <td class="px-6 py-4 font-medium text-gray-900">{{ article.title }}</td>
                  <td class="px-6 py-4">
                    <span :class="articleTypeClass(article.articleType)">
                      {{ articleTypeLabel(article.articleType) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">{{ formatDisplayDate(article.publishedAt) }}</td>
                  <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ formatNumber(article.views) }}</td>
                  <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ formatCurrency(article.revenue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </template>
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
  Filler,
} from 'chart.js'
import { DollarSign, Eye, FileText, Users } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { fetchAuthorStats, type AuthorStatDto, type StatGroupBy } from '@/api/stats'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

const auth = useAuthStore()
const stats = ref<AuthorStatDto | null>(null)
const loading = ref(false)
const error = ref('')
const dateError = ref('')

const groupOptions: Array<{ label: string; value: StatGroupBy }> = [
  { label: 'Theo ngày', value: 'day' },
  { label: 'Theo giờ', value: 'hour' },
  { label: 'Theo tháng', value: 'month' },
]

const { startDate, endDate } = getCurrentMonthRange()
const startDateInput = ref(startDate)
const endDateInput = ref(endDate)
const groupByInput = ref<StatGroupBy>('day')

onMounted(async () => {
  await loadStats()
})

const topicStats = computed(() => stats.value?.topicStats ?? [])

const priceInfo = computed(() => ({
  free: stats.value?.freeViewPrice ?? 200,
  vip: stats.value?.vipViewPrice ?? 500,
}))

const noData = computed(() => {
  if (!stats.value) {
    return false
  }

  return stats.value.totalArticles === 0
    && stats.value.totalViews === 0
    && stats.value.totalRevenue === 0
    && stats.value.totalFollowers === 0
    && stats.value.chart.length === 0
    && stats.value.topArticles.length === 0
    && topicStats.value.length === 0
})

const summaryCards = computed(() => {
  if (!stats.value) {
    return []
  }

  return [
    {
      title: 'Tổng bài viết',
      value: formatNumber(stats.value.totalArticles),
      caption: 'Số bài đã xuất bản trong khoảng thời gian chọn',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Tổng lượt xem',
      value: formatNumber(stats.value.totalViews),
      caption: 'Tổng lượt xem ghi nhận trên bài viết',
      icon: Eye,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Tổng follow',
      value: formatNumber(stats.value.totalFollowers),
      caption: 'Lượng theo dõi tác giả hiện tại',
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-100',
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(stats.value.totalRevenue),
      caption: 'Bài thường 200đ/view, bài VIP 500đ/view',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ]
})

const activePeriod = computed<StatGroupBy>(() => stats.value?.periodUnit ?? groupByInput.value)
const periodLabel = computed(() => {
  switch (activePeriod.value) {
    case 'hour':
      return 'giờ'
    case 'month':
      return 'tháng'
    default:
      return 'ngày'
  }
})
const chartLabels = computed(() => stats.value?.chart.map(point => formatChartLabel(point.date)) ?? [])

const viewsChartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [{
    label: 'Lượt xem',
    data: stats.value?.chart.map(point => point.views) ?? [],
    backgroundColor: '#2563EB',
    borderRadius: 4,
  }],
}))

const revenueChartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [{
    label: 'Doanh thu',
    data: stats.value?.chart.map(point => point.revenue) ?? [],
    borderColor: '#D97706',
    backgroundColor: 'rgba(217,119,6,0.12)',
    borderWidth: 3,
    tension: 0.35,
    pointRadius: 4,
    fill: true,
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
    y: {
      grid: { color: '#E5E7EB' },
      ticks: {
        callback(value: string | number) {
          return typeof value === 'number' ? `${Math.round(value / 1000)}k` : value
        },
      },
    },
  },
}

async function handleSubmit() {
  await loadStats()
}

async function loadStats() {
  dateError.value = ''
  error.value = ''

  if (!auth.userId) {
    error.value = 'Không xác định được tác giả hiện tại từ phiên đăng nhập.'
    stats.value = null
    return
  }

  if (!startDateInput.value || !endDateInput.value) {
    dateError.value = 'Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.'
    return
  }

  if (startDateInput.value > endDateInput.value) {
    dateError.value = 'Khoảng thời gian không hợp lệ. Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.'
    return
  }

  loading.value = true

  try {
    stats.value = await fetchAuthorStats(
      auth.userId,
      toBackendDate(startDateInput.value),
      toBackendDate(endDateInput.value),
      groupByInput.value,
    )
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải thống kê bài viết và doanh thu.'
    stats.value = null
  } finally {
    loading.value = false
  }
}

function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  }
}

function toInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toBackendDate(dateValue: string) {
  return dateValue.replace(/-/g, '')
}

function formatNumber(value: number) {
  return value.toLocaleString('vi-VN')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPlainCurrency(value: number) {
  return `${formatNumber(value)}đ`
}

function formatChartLabel(dateValue: string | null) {
  if (!dateValue) {
    return ''
  }

  if (activePeriod.value === 'hour' && dateValue.length >= 10) {
    return `${dateValue.slice(8, 10)}h ${dateValue.slice(6, 8)}/${dateValue.slice(4, 6)}`
  }

  if (activePeriod.value === 'month' && dateValue.length >= 6) {
    return `${dateValue.slice(4, 6)}/${dateValue.slice(0, 4)}`
  }

  if (dateValue.length >= 8) {
    return `${dateValue.slice(6, 8)}/${dateValue.slice(4, 6)}`
  }

  return dateValue
}

function formatDisplayDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Chưa xác định'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function articleTypeLabel(type: 'FREE' | 'VIP' | null) {
  return type === 'VIP' ? 'VIP' : 'Thường'
}

function articleTypeClass(type: 'FREE' | 'VIP' | null) {
  const baseClass = 'inline-flex rounded-full px-3 py-1 text-xs font-semibold'
  return type === 'VIP'
    ? `${baseClass} bg-amber-100 text-amber-700`
    : `${baseClass} bg-slate-100 text-slate-700`
}
</script>
