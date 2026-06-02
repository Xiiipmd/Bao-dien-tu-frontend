<template>
  <div class="space-y-6">
    <section class="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Admin</span>
          <h2 class="mt-3 text-2xl font-bold tracking-tight text-gray-900">Thống kê hệ thống</h2>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Theo dõi tổng quan view/doanh thu theo thời gian, lọc theo tác giả/chủ đề và xem bảng xếp hạng Top tác giả hoặc Top chủ đề.
          </p>
        </div>
      </div>

      <div v-if="error" class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>
    </section>

    <section class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-bold text-gray-900">1) Tổng quan theo bộ lọc</h3>
          <p class="mt-1 text-sm text-gray-500">Lọc kết hợp theo tác giả, chủ đề, khoảng thời gian và đơn vị hiển thị giờ/ngày/tháng.</p>
        </div>
      </div>

      <form class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6" @submit.prevent="handleOverviewSubmit">
        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Tác giả</span>
          <select
            v-model="overviewFilters.authorId"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả tác giả</option>
            <option v-for="item in authorOptions" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
          </select>
        </label>

        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Chủ đề</span>
          <select
            v-model="overviewFilters.categoryId"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Tất cả chủ đề</option>
            <option v-for="item in categoryOptions" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
          </select>
        </label>

        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Từ ngày</span>
          <input
            v-model="overviewFilters.startDate"
            type="date"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Đến ngày</span>
          <input
            v-model="overviewFilters.endDate"
            type="date"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Đơn vị thời gian</span>
          <select
            v-model="overviewFilters.groupBy"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="hour">Theo giờ</option>
            <option value="day">Theo ngày</option>
            <option value="month">Theo tháng</option>
          </select>
        </label>

        <div class="flex items-end">
          <button
            type="submit"
            :disabled="overviewLoading"
            class="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {{ overviewLoading ? 'Đang tải...' : 'Xem thống kê' }}
          </button>
        </div>
      </form>

      <div v-if="overviewDateError" class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ overviewDateError }}
      </div>

      <div v-if="overview" class="mt-6 space-y-6">
        <section class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div v-for="card in summaryCards" :key="card.title" class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-500">{{ card.title }}</p>
                <h4 class="mt-3 text-3xl font-bold text-gray-900">{{ card.value }}</h4>
              </div>
              <div :class="['flex h-12 w-12 items-center justify-center rounded-full', card.bg]">
                <component :is="card.icon" :class="['h-6 w-6', card.color]" />
              </div>
            </div>
            <p class="mt-4 text-sm text-gray-500">{{ card.caption }}</p>
          </div>
        </section>

        <div v-if="overviewNoData" class="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
          Không có dữ liệu phù hợp với bộ lọc đã chọn.
        </div>

        <template v-else>
          <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h4 class="mb-4 text-base font-bold text-gray-900">Biểu đồ lượt xem</h4>
              <div class="h-72">
                <Bar :data="viewsChartData" :options="barChartOptions" />
              </div>
            </div>

            <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h4 class="mb-4 text-base font-bold text-gray-900">Biểu đồ doanh thu</h4>
              <div class="h-72">
                <Line :data="revenueChartData" :options="lineChartOptions" />
              </div>
            </div>
          </section>

          <section class="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div class="border-b border-gray-100 px-6 py-4">
              <h4 class="text-base font-bold text-gray-900">Bảng chi tiết theo mốc thời gian</h4>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-gray-700">
                  <tr>
                    <th class="px-6 py-3 font-semibold">Thời gian</th>
                    <th class="px-6 py-3 font-semibold">Tác giả</th>
                    <th class="px-6 py-3 font-semibold">Chủ đề</th>
                    <th class="px-6 py-3 font-semibold text-right">Bài viết</th>
                    <th class="px-6 py-3 font-semibold text-right">Lượt xem</th>
                    <th class="px-6 py-3 font-semibold text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr v-for="(row, idx) in overview.details" :key="`${row.period}-${row.authorId}-${row.categoryId}-${idx}`" class="hover:bg-gray-50">
                    <td class="px-6 py-3 font-medium text-gray-900">{{ formatPeriodLabel(row.period, overview.periodUnit) }}</td>
                    <td class="px-6 py-3">{{ row.authorName || '-' }}</td>
                    <td class="px-6 py-3">{{ row.categoryName || '-' }}</td>
                    <td class="px-6 py-3 text-right">{{ formatNumber(row.articles) }}</td>
                    <td class="px-6 py-3 text-right">{{ formatNumber(row.views) }}</td>
                    <td class="px-6 py-3 text-right font-semibold text-gray-900">{{ formatCurrency(row.revenue) }}</td>
                  </tr>
                  <tr v-if="overview.details.length === 0">
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">Không có dòng dữ liệu chi tiết.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>
      </div>
    </section>

    <section class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-bold text-gray-900">2) Top tác giả/chủ đề</h3>
          <p class="mt-1 text-sm text-gray-500">Xếp hạng theo lượt xem hoặc doanh thu trong khoảng thời gian chọn.</p>
        </div>
      </div>

      <form class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6" @submit.prevent="handleTopSubmit">
        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Đối tượng xếp hạng</span>
          <select
            v-model="topFilters.targetType"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="author">Top tác giả</option>
            <option value="category">Top chủ đề</option>
          </select>
        </label>

        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Chỉ số xếp hạng</span>
          <select
            v-model="topFilters.sortBy"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="revenue">Doanh thu</option>
            <option value="views">Lượt xem</option>
          </select>
        </label>

        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Từ ngày</span>
          <input
            v-model="topFilters.startDate"
            type="date"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Đến ngày</span>
          <input
            v-model="topFilters.endDate"
            type="date"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label class="text-sm font-medium text-gray-700 xl:col-span-1">
          <span class="mb-2 block">Top N</span>
          <input
            v-model.number="topFilters.limit"
            type="number"
            min="1"
            max="100"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <div class="flex items-end">
          <button
            type="submit"
            :disabled="topLoading"
            class="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {{ topLoading ? 'Đang tải...' : 'Xem top' }}
          </button>
        </div>
      </form>

      <div v-if="topDateError" class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ topDateError }}
      </div>

      <section class="mt-6 rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4">
          <h4 class="text-base font-bold text-gray-900">Bảng xếp hạng</h4>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-gray-50 text-gray-700">
              <tr>
                <th class="px-6 py-3 font-semibold">Hạng</th>
                <th class="px-6 py-3 font-semibold">Đối tượng</th>
                <th class="px-6 py-3 font-semibold text-right">Bài viết</th>
                <th class="px-6 py-3 font-semibold text-right">Lượt xem</th>
                <th class="px-6 py-3 font-semibold text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="item in topStats" :key="`${item.targetType}-${item.targetId}`" class="hover:bg-gray-50">
                <td class="px-6 py-3 font-semibold text-gray-900">#{{ item.rank }}</td>
                <td class="px-6 py-3 font-medium text-gray-900">{{ item.targetName }}</td>
                <td class="px-6 py-3 text-right">{{ formatNumber(item.articles) }}</td>
                <td class="px-6 py-3 text-right">{{ formatNumber(item.views) }}</td>
                <td class="px-6 py-3 text-right font-semibold text-gray-900">{{ formatCurrency(item.revenue) }}</td>
              </tr>
              <tr v-if="topStats.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">Không có dữ liệu để xếp hạng.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
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
import { DollarSign, Eye, FileText } from 'lucide-vue-next'
import { fetchCategories, type CategoryOption } from '@/api/staff'
import {
  fetchAdminAuthorOptions,
  fetchAdminOverviewStats,
  fetchAdminTopStats,
  type AdminOverviewStatDto,
  type AdminTopStatDto,
  type StatOptionDto,
} from '@/api/stats'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

type GroupBy = 'hour' | 'day' | 'month'
type TopTargetType = 'author' | 'category'
type TopSortBy = 'revenue' | 'views'

const error = ref('')

const authorOptions = ref<StatOptionDto[]>([])
const categoryOptions = ref<CategoryOption[]>([])

const overviewLoading = ref(false)
const topLoading = ref(false)

const overviewDateError = ref('')
const topDateError = ref('')

const overview = ref<AdminOverviewStatDto | null>(null)
const topStats = ref<AdminTopStatDto[]>([])

const today = toInputDate(new Date())
const firstDayOfMonth = toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

const overviewFilters = ref({
  authorId: '',
  categoryId: '',
  startDate: firstDayOfMonth,
  endDate: today,
  groupBy: 'day' as GroupBy,
})

const topFilters = ref({
  targetType: 'author' as TopTargetType,
  sortBy: 'revenue' as TopSortBy,
  startDate: firstDayOfMonth,
  endDate: today,
  limit: 10,
})

onMounted(async () => {
  await loadOptions()
  await Promise.all([loadOverview(), loadTopStats()])
})

const overviewNoData = computed(() => {
  if (!overview.value) {
    return false
  }

  return overview.value.totalArticles === 0
    && overview.value.totalViews === 0
    && overview.value.totalRevenue === 0
    && overview.value.chart.length === 0
})

const summaryCards = computed(() => {
  if (!overview.value) {
    return []
  }

  return [
    {
      title: 'Tổng bài viết',
      value: formatNumber(overview.value.totalArticles),
      caption: 'Số bài viết đáp ứng bộ lọc trong khoảng thời gian chọn',
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Tổng lượt xem',
      value: formatNumber(overview.value.totalViews),
      caption: 'Lượt xem cộng dồn theo bộ lọc',
      icon: Eye,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(overview.value.totalRevenue),
      caption: 'Doanh thu ước tính theo dữ liệu backend',
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ]
})

const chartLabels = computed(() => {
  if (!overview.value) {
    return []
  }

  return overview.value.chart.map(item => formatPeriodLabel(item.date ?? '', overview.value!.periodUnit))
})

const viewsChartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [{
    label: 'Lượt xem',
    data: overview.value?.chart.map(item => item.views) ?? [],
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  }],
}))

const revenueChartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [{
    label: 'Doanh thu',
    data: overview.value?.chart.map(item => item.revenue) ?? [],
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.1)',
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

async function loadOptions() {
  error.value = ''
  try {
    const [authors, categories] = await Promise.all([
      fetchAdminAuthorOptions(),
      fetchCategories(),
    ])

    authorOptions.value = authors
    categoryOptions.value = categories
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải danh sách bộ lọc.'
  }
}

async function handleOverviewSubmit() {
  await loadOverview()
}

async function handleTopSubmit() {
  await loadTopStats()
}

async function loadOverview() {
  overviewDateError.value = ''
  if (!isValidDateRange(overviewFilters.value.startDate, overviewFilters.value.endDate)) {
    overviewDateError.value = 'Khoảng thời gian không hợp lệ ở phần tổng quan.'
    return
  }

  overviewLoading.value = true
  error.value = ''

  try {
    overview.value = await fetchAdminOverviewStats({
      authorId: toOptionalNumber(overviewFilters.value.authorId),
      categoryId: toOptionalNumber(overviewFilters.value.categoryId),
      startDate: toBackendDate(overviewFilters.value.startDate),
      endDate: toBackendDate(overviewFilters.value.endDate),
      groupBy: overviewFilters.value.groupBy,
    })
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải thống kê tổng quan.'
    overview.value = null
  } finally {
    overviewLoading.value = false
  }
}

async function loadTopStats() {
  topDateError.value = ''
  if (!isValidDateRange(topFilters.value.startDate, topFilters.value.endDate)) {
    topDateError.value = 'Khoảng thời gian không hợp lệ ở phần xếp hạng top.'
    return
  }

  if (!topFilters.value.limit || topFilters.value.limit < 1 || topFilters.value.limit > 100) {
    topDateError.value = 'Top N phải trong khoảng từ 1 đến 100.'
    return
  }

  topLoading.value = true
  error.value = ''

  try {
    topStats.value = await fetchAdminTopStats({
      targetType: topFilters.value.targetType,
      sortBy: topFilters.value.sortBy,
      startDate: toBackendDate(topFilters.value.startDate),
      endDate: toBackendDate(topFilters.value.endDate),
      limit: topFilters.value.limit,
    })
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải dữ liệu top.'
    topStats.value = []
  } finally {
    topLoading.value = false
  }
}

function isValidDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return false
  }

  return startDate <= endDate
}

function toOptionalNumber(value: string) {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
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

function formatPeriodLabel(value: string, periodUnit: GroupBy) {
  if (!value) {
    return '-'
  }

  if (periodUnit === 'hour' && value.length === 10) {
    return `${value.slice(8, 10)}h ${value.slice(6, 8)}/${value.slice(4, 6)}`
  }

  if (periodUnit === 'day' && value.length === 8) {
    return `${value.slice(6, 8)}/${value.slice(4, 6)}/${value.slice(0, 4)}`
  }

  if (periodUnit === 'month' && value.length === 6) {
    return `${value.slice(4, 6)}/${value.slice(0, 4)}`
  }

  return value
}
</script>
