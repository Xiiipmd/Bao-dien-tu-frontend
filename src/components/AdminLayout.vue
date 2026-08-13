<template>
  <div class="flex h-screen w-full bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 shrink-0 flex flex-col bg-slate-900 text-white">
      <div class="flex h-16 items-center px-6 border-b border-slate-800">
        <RouterLink to="/" class="flex items-center gap-2 text-white">
          <div class="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold text-xl">N</div>
          <span class="text-xl font-bold tracking-tight">Panel</span>
        </RouterLink>
      </div>

      <nav class="flex-1 space-y-1 px-3 py-6">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
            isActive(item)
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 focus:bg-blue-100 focus:text-blue-700'
          ]"
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <RouterLink to="/" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <LogOut class="h-5 w-5" />
          Trở về Website
        </RouterLink>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm">
        <h1 class="text-xl font-semibold text-gray-800">{{ currentLabel }}</h1>
        <div class="flex items-center gap-4">
          <NotificationBell />
          <RouterLink
            to="/account"
            class="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <UserRound class="h-4 w-4" />
            {{ auth.userName }}
          </RouterLink>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              class="h-9 rounded-full bg-gray-100 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white border border-transparent focus:border-blue-200"
            />
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-auto p-8">
        <div class="mx-auto max-w-6xl">
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LayoutDashboard, FileText, CheckSquare, Crown, LogOut, Search, TrendingUp, UserRound, Users } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import NotificationBell from '@/components/NotificationBell.vue'

const route = useRoute()
const auth = useAuthStore()

const navItems = computed(() => {
  const items = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  ]

  if (auth.isAuthor) {
    items.push({ path: '/admin/posts/manage', label: 'Quản lý bài viết', icon: FileText, exact: false })
    items.push({ path: '/admin/posts/create', label: 'Đăng bài mới', icon: FileText, exact: false })
    items.push({ path: '/admin/revenue', label: 'Thống kê doanh thu', icon: TrendingUp, exact: false })
  }

  if (auth.isAdmin || auth.isCensor) {
    items.push({ path: '/admin/posts/approval', label: 'Duyệt bài', icon: CheckSquare, exact: false })
  }

  if (auth.isAdmin) {
    items.push({ path: '/admin/users', label: 'Quản lý người dùng', icon: Users, exact: false })
    items.push({ path: '/admin/posts/visibility', label: 'Ẩn / Hiện bài', icon: FileText, exact: false })
    items.push({ path: '/admin/revenue', label: 'Thống kê hệ thống', icon: TrendingUp, exact: false })
    items.push({ path: '/admin/vip', label: 'Gói VIP', icon: Crown, exact: false })
  }

  return items
})

function isActive(item: { path: string; exact: boolean }) {
  return item.exact ? route.path === item.path : route.path.startsWith(item.path)
}

const currentLabel = computed(() => {
  return navItems.value.find(item => isActive(item))?.label ?? 'Quản trị'
})
</script>
