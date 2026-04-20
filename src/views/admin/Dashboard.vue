<template>
  <div class="space-y-8">
    <!-- Stats Cards -->
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
          <span class="ml-2 text-gray-500">so với tháng trước</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-6 text-lg font-bold text-gray-900">Lượt truy cập (Tuần)</h3>
        <div class="h-80">
          <Bar :data="barChartData" :options="barChartOptions" />
        </div>
      </div>
      <div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-6 text-lg font-bold text-gray-900">Doanh thu VIP (Tháng)</h3>
        <div class="h-80">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
      </div>
    </div>

    <!-- Recent Posts Table -->
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
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="article in recentArticles" :key="article.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-medium text-gray-900 max-w-[300px] truncate">{{ article.title }}</td>
              <td class="px-6 py-4 uppercase text-xs font-bold">{{ article.category }}</td>
              <td class="px-6 py-4">
                <span v-if="article.isVip" class="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">VIP</span>
                <span v-else class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Free</span>
              </td>
              <td class="px-6 py-4 text-right font-medium">{{ article.views.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
import { dashboardStats, articles } from '@/app/lib/mock-data'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const recentArticles = computed(() => articles.slice(0, 5))

const statCards = [
  { title: 'Tổng bài viết', value: dashboardStats.totalPosts, icon: FileText, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-100' },
  { title: 'Lượt xem tháng này', value: dashboardStats.totalViews, icon: Eye, trend: '+25%', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { title: 'Doanh thu VIP', value: dashboardStats.revenue, icon: DollarSign, trend: '+8%', color: 'text-amber-600', bg: 'bg-amber-100' },
]

const labels = dashboardStats.chartData.map(d => d.name)

const barChartData = {
  labels,
  datasets: [{
    label: 'Lượt xem',
    data: dashboardStats.chartData.map(d => d.views),
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  }],
}

const lineChartData = {
  labels,
  datasets: [{
    label: 'Doanh thu',
    data: dashboardStats.chartData.map(d => d.revenue),
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 3,
    tension: 0.4,
    pointRadius: 4,
  }],
}

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
</script>
