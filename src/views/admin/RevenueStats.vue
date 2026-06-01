<template>
  <div class="space-y-6">
    <template v-if="auth.isAdmin">
      <section class="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div class="flex flex-col gap-5">
          <div>
            <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
              Admin
            </span>
            <h2 class="mt-3 text-2xl font-bold text-gray-900">Thống kê view & doanh thu toàn hệ thống</h2>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Lọc kết hợp theo tác giả, chủ đề và khoảng thời gian; dữ liệu có thể xem theo giờ, ngày hoặc tháng.
            </p>
          </div>

          <form class="grid gap-3 md:grid-cols-2 xl:grid-cols-4" @submit.prevent="loadAdminStats">
            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Tác giả</span>
              <select v-model="adminAuthorIdInput" class="filter-control">
                <option value="">Tất cả tác giả</option>
                <option v-for="author in authorOptions" :key="author.id" :value="String(author.id)">
                  {{ author.name }}
                </option>
              </select>
            </label>

            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Chủ đề</span>
              <select v-model="adminCategoryIdInput" class="filter-control">
                <option value="">Tất cả chủ đề</option>
                <option v-for="category in categoryOptions" :key="category.id" :value="String(category.id)">
                  {{ category.name }}
                </option>
              </select>
            </label>

            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Từ ngày</span>
              <input v-model="startDateInput" type="date" class="filter-control" />
            </label>

            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Đến ngày</span>
              <input v-model="endDateInput" type="date" class="filter-control" />
            </label>

            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Đơn vị thời gian</span>
              <select v-model="groupByInput" class="filter-control">
                <option v-for="option in groupOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Loại số liệu</span>
              <select v-model="metricInput" class="filter-control">
                <option value="both">View và doanh thu</option>
                <option value="views">Chỉ lượt view</option>
                <option value="revenue">Chỉ doanh thu</option>
              </select>
            </label>

            <div class="flex items-end">
              <button type="submit" :disabled="adminLoading" class="primary-button">
                {{ adminLoading ? 'Đang tải...' : 'Lọc dữ liệu' }}
              </button>
            </div>
          </form>

          <div class="flex flex-wrap gap-3 text-xs text-gray-500">
            <span class="rounded-full bg-gray-100 px-3 py-1">Bài thường: {{ formatPlainCurrency(adminPriceInfo.free) }}/view</span>
            <span class="rounded-full bg-gray-100 px-3 py-1">Bài VIP: {{ formatPlainCurrency(adminPriceInfo.vip) }}/view</span>
          </div>

          <div v-if="dateError" class="alert-error">{{ dateError }}</div>
          <div v-if="adminError" class="alert-error">{{ adminError }}</div>
        </div>
      </section>

      <div v-if="adminLoading" class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div v-for="placeholder in 3" :key="placeholder" class="h-32 animate-pulse rounded-3xl border border-gray-100 bg-white shadow-sm"></div>
      </div>

      <template v-else-if="adminOverview">
        <section class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SummaryCard title="Tổng bài viết" :value="formatNumber(adminOverview.totalArticles)" caption="Bài xuất bản trong khoảng lọc" :icon="FileText" color="text-blue-600" bg="bg-blue-100" />
          <SummaryCard title="Tổng lượt view" :value="formatNumber(adminOverview.totalViews)" caption="Lượt xem thỏa mãn bộ lọc" :icon="Eye" color="text-emerald-600" bg="bg-emerald-100" />
          <SummaryCard title="Tổng doanh thu" :value="formatCurrency(adminOverview.totalRevenue)" caption="Tính theo loại bài thường/VIP" :icon="DollarSign" color="text-amber-600" bg="bg-amber-100" />
        </section>

        <div v-if="adminNoData" class="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
          Không có dữ liệu phù hợp với bộ lọc đã chọn.
        </div>

        <template v-else>
          <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div v-if="showViews" class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-900">Lượt view theo {{ periodLabel(adminOverview.periodUnit) }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ adminFilterSummary }}</p>
              </div>
              <div class="h-80">
                <Bar :data="adminViewsChartData" :options="barChartOptions" />
              </div>
            </div>

            <div v-if="showRevenue" class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-900">Doanh thu theo {{ periodLabel(adminOverview.periodUnit) }}</h3>
                <p class="mt-1 text-sm text-gray-500">{{ adminFilterSummary }}</p>
              </div>
              <div class="h-80">
                <Line :data="adminRevenueChartData" :options="lineChartOptions" />
              </div>
            </div>
          </section>

          <section class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div class="border-b border-gray-100 px-6 py-5">
              <h3 class="text-lg font-bold text-gray-900">Chi tiết theo bộ lọc</h3>
              <p class="mt-1 text-sm text-gray-500">Mỗi dòng là một mốc thời gian, tác giả và chủ đề thỏa mãn điều kiện lọc.</p>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-gray-700">
                  <tr>
                    <th class="px-6 py-4 font-semibold">Mốc thời gian</th>
                    <th class="px-6 py-4 font-semibold">Tác giả</th>
                    <th class="px-6 py-4 font-semibold">Chủ đề</th>
                    <th class="px-6 py-4 text-right font-semibold">Số bài</th>
                    <th class="px-6 py-4 text-right font-semibold">Lượt view</th>
                    <th class="px-6 py-4 text-right font-semibold">Doanh thu</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr v-for="row in adminOverview.details" :key="`${row.period}-${row.authorId}-${row.categoryId}`" class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-medium text-gray-900">{{ formatPeriod(row.period, adminOverview.periodUnit) }}</td>
                    <td class="px-6 py-4">{{ row.authorName }}</td>
                    <td class="px-6 py-4">{{ row.categoryName }}</td>
                    <td class="px-6 py-4 text-right">{{ formatNumber(row.articles) }}</td>
                    <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ formatNumber(row.views) }}</td>
                    <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ formatCurrency(row.revenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>
      </template>

      <section class="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div class="flex flex-col gap-5">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Top tác giả / chủ đề</h3>
            <p class="mt-1 text-sm text-gray-500">Chọn một loại xếp hạng tại một thời điểm, rồi sắp xếp theo doanh thu hoặc lượt view.</p>
          </div>

          <form class="grid gap-3 md:grid-cols-4" @submit.prevent="loadAdminTopStats">
            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Đối tượng xếp hạng</span>
              <select v-model="topTargetInput" class="filter-control">
                <option value="author">Top tác giả</option>
                <option value="category">Top chủ đề</option>
              </select>
            </label>

            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Sắp xếp theo</span>
              <select v-model="topSortInput" class="filter-control">
                <option value="revenue">Doanh thu</option>
                <option value="views">Lượt view</option>
              </select>
            </label>

            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Top N</span>
              <input v-model.number="topLimitInput" type="number" min="1" max="100" class="filter-control" />
            </label>

            <div class="flex items-end">
              <button type="submit" :disabled="topLoading" class="primary-button">
                {{ topLoading ? 'Đang tải...' : 'Xem top' }}
              </button>
            </div>
          </form>

          <div v-if="topError" class="alert-error">{{ topError }}</div>
        </div>

        <div v-if="topLoading" class="mt-6 h-64 animate-pulse rounded-3xl border border-gray-100 bg-gray-50"></div>
        <div v-else-if="adminTopRows.length === 0" class="mt-6 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
          Không có dữ liệu để xếp hạng trong khoảng thời gian đã chọn.
        </div>
        <div v-else class="mt-6 overflow-x-auto rounded-2xl border border-gray-100">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-gray-50 text-gray-700">
              <tr>
                <th class="px-6 py-4 font-semibold">Hạng</th>
                <th class="px-6 py-4 font-semibold">{{ topTargetInput === 'author' ? 'Tác giả' : 'Chủ đề' }}</th>
                <th class="px-6 py-4 text-right font-semibold">Số bài</th>
                <th class="px-6 py-4 text-right font-semibold">Lượt view</th>
                <th class="px-6 py-4 text-right font-semibold">Doanh thu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="row in adminTopRows" :key="`${row.targetType}-${row.targetId}`" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-bold text-gray-900">#{{ row.rank }}</td>
                <td class="px-6 py-4 font-medium text-gray-900">{{ row.targetName }}</td>
                <td class="px-6 py-4 text-right">{{ formatNumber(row.articles) }}</td>
                <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ formatNumber(row.views) }}</td>
                <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ formatCurrency(row.revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="rounded-3xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <span class="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase text-sky-700">Tác giả</span>
            <h2 class="mt-3 text-2xl font-bold text-gray-900">Thống kê bài viết & doanh thu</h2>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              Theo dõi số bài, lượt xem, lượng follow và doanh thu theo từng chủ đề trong khoảng thời gian đã chọn.
            </p>
          </div>

          <form class="grid gap-3 sm:grid-cols-2 xl:grid-cols-[160px_160px_150px_auto]" @submit.prevent="loadAuthorStats">
            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Từ ngày</span>
              <input v-model="startDateInput" type="date" class="filter-control" />
            </label>

            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Đến ngày</span>
              <input v-model="endDateInput" type="date" class="filter-control" />
            </label>

            <label class="text-sm font-medium text-gray-700">
              <span class="mb-2 block">Nhóm theo</span>
              <select v-model="groupByInput" class="filter-control">
                <option v-for="option in groupOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <div class="flex items-end">
              <button type="submit" :disabled="authorLoading" class="primary-button">
                {{ authorLoading ? 'Đang tải...' : 'Xem thống kê' }}
              </button>
            </div>
          </form>
        </div>

        <div class="mt-5 flex flex-wrap gap-3 text-xs text-gray-500">
          <span class="rounded-full bg-gray-100 px-3 py-1">Mặc định: tháng hiện tại</span>
          <span class="rounded-full bg-gray-100 px-3 py-1">Bài thường: {{ formatPlainCurrency(authorPriceInfo.free) }}/view</span>
          <span class="rounded-full bg-gray-100 px-3 py-1">Bài VIP: {{ formatPlainCurrency(authorPriceInfo.vip) }}/view</span>
        </div>

        <div v-if="dateError" class="mt-5 alert-error">{{ dateError }}</div>
        <div v-if="authorError" class="mt-5 alert-error">{{ authorError }}</div>
      </section>

      <div v-if="authorLoading" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div v-for="placeholder in 4" :key="placeholder" class="h-32 animate-pulse rounded-3xl border border-gray-100 bg-white shadow-sm"></div>
      </div>

      <template v-else-if="authorStats">
        <section class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Tổng bài viết" :value="formatNumber(authorStats.totalArticles)" caption="Bài đã xuất bản trong khoảng thời gian chọn" :icon="FileText" color="text-blue-600" bg="bg-blue-100" />
          <SummaryCard title="Tổng lượt xem" :value="formatNumber(authorStats.totalViews)" caption="Lượt xem ghi nhận trên bài viết" :icon="Eye" color="text-emerald-600" bg="bg-emerald-100" />
          <SummaryCard title="Tổng follow" :value="formatNumber(authorStats.totalFollowers)" caption="Lượng theo dõi tác giả hiện tại" :icon="Users" color="text-violet-600" bg="bg-violet-100" />
          <SummaryCard title="Doanh thu" :value="formatCurrency(authorStats.totalRevenue)" caption="Bài thường 200đ/view, bài VIP 500đ/view" :icon="DollarSign" color="text-amber-600" bg="bg-amber-100" />
        </section>

        <div v-if="authorNoData" class="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
          Không có dữ liệu thống kê trong khoảng thời gian đã chọn.
        </div>

        <template v-else>
          <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="mb-6 text-lg font-bold text-gray-900">Lượt xem theo {{ periodLabel(authorStats.periodUnit) }}</h3>
              <div class="h-80">
                <Bar :data="authorViewsChartData" :options="barChartOptions" />
              </div>
            </div>

            <div class="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 class="mb-6 text-lg font-bold text-gray-900">Doanh thu theo {{ periodLabel(authorStats.periodUnit) }}</h3>
              <div class="h-80">
                <Line :data="authorRevenueChartData" :options="lineChartOptions" />
              </div>
            </div>
          </section>

          <section class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div class="border-b border-gray-100 px-6 py-5">
              <h3 class="text-lg font-bold text-gray-900">Doanh thu theo chủ đề</h3>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-gray-700">
                  <tr>
                    <th class="px-6 py-4 font-semibold">Chủ đề</th>
                    <th class="px-6 py-4 text-right font-semibold">Số bài</th>
                    <th class="px-6 py-4 text-right font-semibold">Follow</th>
                    <th class="px-6 py-4 text-right font-semibold">Lượt xem</th>
                    <th class="px-6 py-4 text-right font-semibold">Doanh thu</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr v-for="topic in authorStats.topicStats" :key="topic.categoryId" class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-medium text-gray-900">{{ topic.categoryName }}</td>
                    <td class="px-6 py-4 text-right">{{ formatNumber(topic.articles) }}</td>
                    <td class="px-6 py-4 text-right">{{ formatNumber(topic.followers) }}</td>
                    <td class="px-6 py-4 text-right">{{ formatNumber(topic.views) }}</td>
                    <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ formatCurrency(topic.revenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div class="border-b border-gray-100 px-6 py-5">
              <h3 class="text-lg font-bold text-gray-900">Top bài viết theo lượt xem</h3>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-gray-700">
                  <tr>
                    <th class="px-6 py-4 font-semibold">Tiêu đề</th>
                    <th class="px-6 py-4 font-semibold">Loại</th>
                    <th class="px-6 py-4 font-semibold">Ngày xuất bản</th>
                    <th class="px-6 py-4 text-right font-semibold">Lượt xem</th>
                    <th class="px-6 py-4 text-right font-semibold">Doanh thu</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr v-for="article in authorStats.topArticles" :key="article.articleId" class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-medium text-gray-900">{{ article.title }}</td>
                    <td class="px-6 py-4">
                      <span :class="articleTypeClass(article.articleType)">{{ articleTypeLabel(article.articleType) }}</span>
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { DollarSign, Eye, FileText, Users } from 'lucide-vue-next'
import { fetchCategories, type CategoryOption } from '@/api/articles'
import {
  fetchAdminOverviewStats,
  fetchAdminStatAuthors,
  fetchAdminTopStats,
  fetchAuthorStats,
  type AdminOverviewStatDto,
  type AdminTopSort,
  type AdminTopStatDto,
  type AdminTopTarget,
  type AuthorStatDto,
  type StatGroupBy,
  type StatOptionDto,
} from '@/api/stats'
import { useAuthStore } from '@/stores/auth'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler)

const SummaryCard = defineComponent({
  props: {
    title: { type: String, required: true },
    value: { type: String, required: true },
    caption: { type: String, required: true },
    icon: { type: Object, required: true },
    color: { type: String, required: true },
    bg: { type: String, required: true },
  },
  setup(props) {
    return () => h('div', { class: 'rounded-3xl border border-gray-100 bg-white p-6 shadow-sm' }, [
      h('div', { class: 'flex items-center justify-between gap-4' }, [
        h('div', [
          h('p', { class: 'text-sm font-medium text-gray-500' }, props.title),
          h('h3', { class: 'mt-3 text-3xl font-bold text-gray-900' }, props.value),
        ]),
        h('div', { class: ['flex h-12 w-12 shrink-0 items-center justify-center rounded-full', props.bg] }, [
          h(props.icon, { class: ['h-6 w-6', props.color] }),
        ]),
      ]),
      h('p', { class: 'mt-4 text-sm text-gray-500' }, props.caption),
    ])
  },
})

const auth = useAuthStore()
const authorStats = ref<AuthorStatDto | null>(null)
const adminOverview = ref<AdminOverviewStatDto | null>(null)
const adminTopRows = ref<AdminTopStatDto[]>([])
const authorOptions = ref<StatOptionDto[]>([])
const categoryOptions = ref<CategoryOption[]>([])

const authorLoading = ref(false)
const adminLoading = ref(false)
const topLoading = ref(false)
const authorError = ref('')
const adminError = ref('')
const topError = ref('')
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
const metricInput = ref<'both' | 'views' | 'revenue'>('both')
const adminAuthorIdInput = ref('')
const adminCategoryIdInput = ref('')
const topTargetInput = ref<AdminTopTarget>('author')
const topSortInput = ref<AdminTopSort>('revenue')
const topLimitInput = ref(10)

onMounted(async () => {
  if (auth.isAdmin) {
    await loadAdminOptions()
    await loadAdminStats()
  } else {
    await loadAuthorStats()
  }
})

const adminPriceInfo = computed(() => ({
  free: adminOverview.value?.freeViewPrice ?? 200,
  vip: adminOverview.value?.vipViewPrice ?? 500,
}))

const authorPriceInfo = computed(() => ({
  free: authorStats.value?.freeViewPrice ?? 200,
  vip: authorStats.value?.vipViewPrice ?? 500,
}))

const showViews = computed(() => metricInput.value === 'both' || metricInput.value === 'views')
const showRevenue = computed(() => metricInput.value === 'both' || metricInput.value === 'revenue')

const adminNoData = computed(() => {
  if (!adminOverview.value) return false
  return adminOverview.value.totalArticles === 0
    && adminOverview.value.totalViews === 0
    && adminOverview.value.totalRevenue === 0
    && adminOverview.value.chart.length === 0
    && adminOverview.value.details.length === 0
})

const authorNoData = computed(() => {
  if (!authorStats.value) return false
  return authorStats.value.totalArticles === 0
    && authorStats.value.totalViews === 0
    && authorStats.value.totalRevenue === 0
    && authorStats.value.totalFollowers === 0
    && authorStats.value.chart.length === 0
    && authorStats.value.topArticles.length === 0
    && authorStats.value.topicStats.length === 0
})

const adminFilterSummary = computed(() => {
  const authorName = authorOptions.value.find(item => String(item.id) === adminAuthorIdInput.value)?.name ?? 'Tất cả tác giả'
  const categoryName = categoryOptions.value.find(item => String(item.id) === adminCategoryIdInput.value)?.name ?? 'Tất cả chủ đề'
  return `${authorName} • ${categoryName} • ${formatInputDate(startDateInput.value)} - ${formatInputDate(endDateInput.value)}`
})

const adminViewsChartData = computed(() => ({
  labels: adminOverview.value?.chart.map(point => formatPeriod(point.date, adminOverview.value?.periodUnit ?? groupByInput.value)) ?? [],
  datasets: [{
    label: 'Lượt view',
    data: adminOverview.value?.chart.map(point => point.views) ?? [],
    backgroundColor: '#2563EB',
    borderRadius: 4,
  }],
}))

const adminRevenueChartData = computed(() => ({
  labels: adminOverview.value?.chart.map(point => formatPeriod(point.date, adminOverview.value?.periodUnit ?? groupByInput.value)) ?? [],
  datasets: [{
    label: 'Doanh thu',
    data: adminOverview.value?.chart.map(point => point.revenue) ?? [],
    borderColor: '#D97706',
    backgroundColor: 'rgba(217,119,6,0.12)',
    borderWidth: 3,
    tension: 0.35,
    pointRadius: 4,
    fill: true,
  }],
}))

const authorViewsChartData = computed(() => ({
  labels: authorStats.value?.chart.map(point => formatPeriod(point.date, authorStats.value?.periodUnit ?? groupByInput.value)) ?? [],
  datasets: [{
    label: 'Lượt xem',
    data: authorStats.value?.chart.map(point => point.views) ?? [],
    backgroundColor: '#2563EB',
    borderRadius: 4,
  }],
}))

const authorRevenueChartData = computed(() => ({
  labels: authorStats.value?.chart.map(point => formatPeriod(point.date, authorStats.value?.periodUnit ?? groupByInput.value)) ?? [],
  datasets: [{
    label: 'Doanh thu',
    data: authorStats.value?.chart.map(point => point.revenue) ?? [],
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

async function loadAdminOptions() {
  try {
    const [authors, categories] = await Promise.all([fetchAdminStatAuthors(), fetchCategories()])
    authorOptions.value = authors
    categoryOptions.value = categories
  } catch {
    authorOptions.value = []
    categoryOptions.value = []
  }
}

async function loadAdminStats() {
  dateError.value = ''
  adminError.value = ''

  if (!validateDateRange()) return

  adminLoading.value = true
  try {
    adminOverview.value = await fetchAdminOverviewStats({
      authorId: toOptionalNumber(adminAuthorIdInput.value),
      categoryId: toOptionalNumber(adminCategoryIdInput.value),
      startDate: toBackendDate(startDateInput.value),
      endDate: toBackendDate(endDateInput.value),
      groupBy: groupByInput.value,
    })
    await loadAdminTopStats()
  } catch (err: any) {
    adminError.value = err?.response?.data?.message ?? 'Không thể tải thống kê hệ thống.'
    adminOverview.value = null
  } finally {
    adminLoading.value = false
  }
}

async function loadAdminTopStats() {
  topError.value = ''
  if (!validateDateRange()) return

  if (!topLimitInput.value || topLimitInput.value <= 0 || topLimitInput.value > 100) {
    topError.value = 'Số lượng Top N phải trong khoảng 1 đến 100.'
    return
  }

  topLoading.value = true
  try {
    adminTopRows.value = await fetchAdminTopStats({
      targetType: topTargetInput.value,
      sortBy: topSortInput.value,
      startDate: toBackendDate(startDateInput.value),
      endDate: toBackendDate(endDateInput.value),
      limit: topLimitInput.value,
    })
  } catch (err: any) {
    topError.value = err?.response?.data?.message ?? 'Không thể tải bảng xếp hạng.'
    adminTopRows.value = []
  } finally {
    topLoading.value = false
  }
}

async function loadAuthorStats() {
  dateError.value = ''
  authorError.value = ''

  if (!auth.userId) {
    authorError.value = 'Không xác định được tác giả hiện tại từ phiên đăng nhập.'
    authorStats.value = null
    return
  }

  if (!validateDateRange()) return

  authorLoading.value = true
  try {
    authorStats.value = await fetchAuthorStats(
      auth.userId,
      toBackendDate(startDateInput.value),
      toBackendDate(endDateInput.value),
      groupByInput.value,
    )
  } catch (err: any) {
    authorError.value = err?.response?.data?.message ?? 'Không thể tải thống kê bài viết và doanh thu.'
    authorStats.value = null
  } finally {
    authorLoading.value = false
  }
}

function validateDateRange() {
  if (!startDateInput.value || !endDateInput.value) {
    dateError.value = 'Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.'
    return false
  }
  if (startDateInput.value > endDateInput.value) {
    dateError.value = 'Khoảng thời gian không hợp lệ. Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.'
    return false
  }
  return true
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

function toOptionalNumber(value: string) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
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

function formatInputDate(value: string) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function periodLabel(unit: StatGroupBy) {
  switch (unit) {
    case 'hour':
      return 'giờ'
    case 'month':
      return 'tháng'
    default:
      return 'ngày'
  }
}

function formatPeriod(dateValue: string | null, unit: StatGroupBy) {
  if (!dateValue) return ''
  if (unit === 'hour' && dateValue.length >= 10) {
    return `${dateValue.slice(8, 10)}h ${dateValue.slice(6, 8)}/${dateValue.slice(4, 6)}`
  }
  if (unit === 'month' && dateValue.length >= 6) {
    return `${dateValue.slice(4, 6)}/${dateValue.slice(0, 4)}`
  }
  if (dateValue.length >= 8) {
    return `${dateValue.slice(6, 8)}/${dateValue.slice(4, 6)}/${dateValue.slice(0, 4)}`
  }
  return dateValue
}

function formatDisplayDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa xác định'
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

<style scoped>
.filter-control {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #d1d5db;
  background: #ffffff;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.filter-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px #dbeafe;
}

.primary-button {
  width: 100%;
  border-radius: 0.75rem;
  background: #2563eb;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  transition: background-color 0.15s ease;
}

.primary-button:hover:not(:disabled) {
  background: #1d4ed8;
}

.primary-button:disabled {
  cursor: not-allowed;
  background: #93c5fd;
}

.alert-error {
  border-radius: 1rem;
  border: 1px solid #fecaca;
  background: #fef2f2;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #b91c1c;
}
</style>
