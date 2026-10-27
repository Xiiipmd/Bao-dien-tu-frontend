<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div class="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">N</div>
          <span class="text-xl font-black tracking-tight text-gray-900 hidden md:block">NewsDaily</span>
        </RouterLink>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <RouterLink to="/" class="text-sm font-semibold text-gray-700 hover:text-blue-600">Trang chủ</RouterLink>
          <div class="relative group cursor-pointer">
            <span class="text-sm font-semibold text-gray-700 hover:text-blue-600">Chuyên mục</span>
            <div class="absolute left-0 top-full pt-2 hidden group-hover:block w-48">
              <div class="rounded-lg bg-white p-2 shadow-lg border border-gray-100">
                <RouterLink
                  v-for="category in categories"
                  :key="category"
                  :to="`/search?category=${encodeURIComponent(category)}`"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded"
                >
                  {{ category }}
                </RouterLink>
              </div>
            </div>
          </div>
          <RouterLink v-if="auth.isReader" to="/vip" class="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700">
            <Crown class="h-4 w-4" /> Hội viên VIP
          </RouterLink>
        </nav>

        <!-- Search & Actions -->
        <div class="flex items-center gap-4">

          <!-- Search: desktop hiển thị form, mobile chỉ hiện icon -->
          <form @submit.prevent="handleSearch" class="hidden md:flex relative items-center">
            <Search class="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm bài viết..."
              class="h-10 w-64 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </form>
          <button class="md:hidden p-2 text-gray-600" @click="openSearchDrawer" aria-label="Tìm kiếm">
            <Search class="h-6 w-6" />
          </button>

          <div ref="headerMenus" class="flex items-center gap-2">
            <template v-if="auth.isLoggedIn">
              <div class="relative">
                <button
                  type="button"
                  class="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  aria-label="Thông báo"
                  :aria-expanded="notificationMenuOpen"
                  @click.stop="toggleNotificationMenu"
                >
                  <Bell class="h-5 w-5" />
                  <span
                    v-if="unreadCount > 0"
                    class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white"
                  >
                    {{ unreadCount > 9 ? '9+' : unreadCount }}
                  </span>
                </button>

                <div
                  v-if="notificationMenuOpen"
                  class="fixed left-4 right-4 top-[4.5rem] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[25rem]"
                  @click.stop
                >
                  <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                      <p class="font-bold text-slate-950">Thông báo</p>
                      <p class="mt-0.5 text-xs text-slate-500">Tin mới, phản hồi và công việc cần xử lý</p>
                    </div>
                    <button
                      v-if="unreadCount > 0"
                      type="button"
                      class="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      :disabled="notificationActionPending"
                      @click="handleMarkAllRead"
                    >
                      Đọc tất cả
                    </button>
                  </div>

                  <div v-if="notificationLoading" class="flex h-40 items-center justify-center text-sm text-slate-500">
                    <LoaderCircle class="mr-2 h-5 w-5 animate-spin" /> Đang tải...
                  </div>
                  <div v-else-if="notificationError" class="p-5 text-sm text-red-600">
                    <p>{{ notificationError }}</p>
                    <button type="button" class="mt-2 font-bold hover:underline" @click="loadNotifications">Thử lại</button>
                  </div>
                  <div v-else-if="notifications.length === 0" class="px-6 py-10 text-center">
                    <Bell class="mx-auto h-8 w-8 text-slate-300" />
                    <p class="mt-3 font-semibold text-slate-800">Chưa có thông báo</p>
                    <p class="mt-1 text-sm text-slate-500">Thông báo phù hợp sẽ xuất hiện tại đây.</p>
                  </div>
                  <div v-else class="max-h-[28rem] overflow-y-auto">
                    <button
                      v-for="item in notifications"
                      :key="item.id"
                      type="button"
                      class="flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-0 hover:bg-slate-50"
                      :class="item.read ? 'bg-white' : 'bg-blue-50/60'"
                      @click="openNotification(item)"
                    >
                      <img :src="item.articleImage" :alt="item.title" class="h-12 w-14 shrink-0 rounded-lg bg-slate-100 object-cover" />
                      <span class="min-w-0 flex-1">
                        <span class="flex items-center gap-2">
                          <span class="truncate text-sm font-bold text-slate-900">{{ item.title }}</span>
                          <span v-if="!item.read" class="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        </span>
                        <span class="mt-1 block line-clamp-2 text-xs leading-5 text-slate-600">{{ item.message }}</span>
                        <span class="mt-1.5 block text-[11px] font-medium text-slate-400">{{ formatNotificationTime(item.createdAt) }}</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="relative hidden md:block">
                <button
                  type="button"
                  class="flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 pl-1.5 pr-3 text-gray-700 transition hover:border-blue-200 hover:bg-blue-50"
                  :aria-expanded="accountMenuOpen"
                  @click.stop="toggleAccountMenu"
                >
                  <span class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs font-black text-white">
                    <img v-if="auth.avatar" :src="auth.avatar" :alt="auth.userName ?? 'Ảnh đại diện'" class="h-full w-full object-cover" />
                    <span v-else>{{ accountInitial }}</span>
                  </span>
                  <span class="max-w-28 truncate text-sm font-semibold">{{ auth.userName }}</span>
                  <Crown v-if="auth.isVip" class="h-4 w-4 text-amber-500" title="Thành viên VIP" />
                  <ChevronDown class="h-4 w-4 text-slate-400" />
                </button>

                <div v-if="accountMenuOpen" class="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl" @click.stop>
                  <div class="border-b border-slate-100 px-3 py-3">
                    <p class="truncate text-sm font-bold text-slate-900">{{ auth.userName }}</p>
                    <p class="mt-1 text-xs font-semibold text-slate-500">{{ roleLabel }}</p>
                  </div>
                  <RouterLink to="/account" class="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="accountMenuOpen = false">
                    <UserRound class="h-4 w-4 text-slate-500" /> Tài khoản
                  </RouterLink>
                  <RouterLink v-if="auth.isStaff" to="/admin" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50" @click="accountMenuOpen = false">
                    <BriefcaseBusiness class="h-4 w-4" /> Khu vực làm việc
                  </RouterLink>
                  <RouterLink v-if="auth.isReader" to="/vip" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50" @click="accountMenuOpen = false">
                    <Crown class="h-4 w-4" /> Hội viên VIP
                  </RouterLink>
                  <button type="button" class="mt-2 flex w-full items-center gap-3 border-t border-slate-100 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50" @click="handleLogout">
                    <LogOut class="h-4 w-4" /> Đăng xuất
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <RouterLink to="/login" class="hidden text-sm font-semibold text-gray-700 hover:text-blue-600 md:block">Đăng nhập</RouterLink>
              <RouterLink to="/register" class="hidden rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 md:block">Đăng ký</RouterLink>
            </template>

            <button class="md:hidden p-2 text-gray-600" @click="drawerOpen = true" aria-label="Mở menu">
              <Menu class="h-6 w-6" />
            </button>
              <!-- Mobile Drawer Navigation -->
              <transition name="fade">
                <div v-if="drawerOpen" class="fixed inset-0 z-50 bg-black/40 md:hidden" @click.self="drawerOpen = false">
                  <nav class="fixed left-0 top-0 h-full w-4/5 max-w-xs bg-white shadow-xl flex flex-col p-6 gap-4 animate-slide-in">
                    <div class="flex items-center gap-2 mb-4">
                      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">N</div>
                      <span class="text-xl font-black tracking-tight text-gray-900">NewsDaily</span>
                    </div>
                    <!-- Search input trên mobile -->
                    <form @submit.prevent="handleSearch" class="mb-2 flex items-center gap-2">
                      <input
                        ref="mobileSearchInput"
                        v-model="searchQuery"
                        type="text"
                        placeholder="Tìm kiếm tin tức, bài viết..."
                        class="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-4 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      />
                      <button type="submit" class="p-2 text-blue-600">
                        <Search class="h-5 w-5" />
                      </button>
                    </form>
                    <RouterLink to="/" class="py-3 px-2 rounded text-base font-semibold text-gray-700 hover:bg-gray-100" @click="drawerOpen = false">Trang chủ</RouterLink>
                    <div>
                      <button type="button" class="w-full text-left text-base font-semibold text-gray-700 mb-1 flex items-center justify-between" @click="showMobileCategories = !showMobileCategories">
                        Chuyên mục
                        <svg :class="{'rotate-180': showMobileCategories}" class="w-4 h-4 ml-2 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
                      </button>
                      <transition name="fade">
                        <div v-if="showMobileCategories" class="flex flex-col gap-1 mt-1">
                          <RouterLink v-for="category in categories" :key="category" :to="`/search?category=${encodeURIComponent(category)}`" class="py-2 px-2 rounded text-base font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 active:bg-blue-100" @click="drawerOpen = false; showMobileCategories = false">{{ category }}</RouterLink>
                        </div>
                      </transition>
                    </div>
                    <RouterLink v-if="auth.isReader" to="/vip" class="py-3 px-2 rounded text-base font-semibold text-amber-600 hover:bg-amber-50" @click="drawerOpen = false">Hội viên VIP</RouterLink>
                    <div class="border-t border-gray-200 my-2"></div>
                    <template v-if="auth.isLoggedIn">
                      <div class="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <span class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-black text-white">
                          <img v-if="auth.avatar" :src="auth.avatar" :alt="auth.userName ?? 'Ảnh đại diện'" class="h-full w-full object-cover" />
                          <span v-else>{{ accountInitial }}</span>
                        </span>
                        <span class="min-w-0 flex-1">
                          <span class="block truncate font-semibold text-gray-700">{{ auth.userName }}</span>
                          <span class="block text-xs text-slate-500">{{ roleLabel }}</span>
                        </span>
                        <Crown v-if="auth.isVip" class="h-5 w-5 text-amber-500" title="Thành viên VIP" />
                      </div>
                      <RouterLink to="/account" class="flex items-center gap-2 rounded px-2 py-2 text-base font-semibold text-gray-700 hover:bg-gray-100" @click="drawerOpen = false">
                        <UserRound class="h-5 w-5" /> Tài khoản
                      </RouterLink>
                      <RouterLink v-if="auth.isStaff" to="/admin" class="flex items-center gap-2 rounded px-2 py-2 text-base font-semibold text-blue-700 hover:bg-blue-50" @click="drawerOpen = false">
                        <BriefcaseBusiness class="h-5 w-5" /> Khu vực làm việc
                      </RouterLink>
                      <button @click="handleLogout(); drawerOpen = false" class="w-full py-2 px-2 rounded text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut class="h-5 w-5" /> Đăng xuất
                      </button>
                    </template>
                    <template v-else>
                      <RouterLink to="/login" class="py-2 px-2 rounded text-base font-semibold text-gray-700 hover:bg-gray-100" @click="drawerOpen = false">Đăng nhập</RouterLink>
                      <RouterLink to="/register" class="py-2 px-2 rounded text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150" @click="drawerOpen = false">Đăng ký</RouterLink>
                    </template>
                  </nav>
                </div>
              </transition>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white py-12">
      <div class="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <RouterLink to="/" class="flex items-center gap-2 mb-4">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">N</div>
            <span class="text-xl font-black tracking-tight text-gray-900">NewsDaily</span>
          </RouterLink>
          <p class="text-gray-500 text-sm max-w-sm">
            Tin tức nhanh, chính xác, chuyên sâu về thời sự, kinh tế, công nghệ, đời sống và nhiều lĩnh vực khác.
          </p>
        </div>
        <div>
          <h4 class="font-bold text-gray-900 mb-4">Về NewsDaily</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li><a href="#" class="hover:text-blue-600">Về chúng tôi</a></li>
            <li><a href="#" class="hover:text-blue-600">Tuyển dụng</a></li>
            <li><a href="#" class="hover:text-blue-600">Điều khoản sử dụng</a></li>
            <li><a href="#" class="hover:text-blue-600">Chính sách bảo mật</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-gray-900 mb-4">Liên hệ tòa soạn</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>Email: contact@newsdaily.vn</li>
            <li>SĐT: (028) 3812 3456</li>
            <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
          </ul>
        </div>
      </div>
      <div class="container mx-auto px-4 lg:px-8 mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
        © {{ new Date().getFullYear() }} Báo Điện Tử NewsDaily. Bản quyền thuộc về tòa soạn.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  Crown,
  LoaderCircle,
  LogOut,
  Menu,
  Search,
  UserRound,
} from 'lucide-vue-next'
import { fetchCategories } from '@/api/articles'
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NewsNotification,
} from '@/api/notifications'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const searchQuery = ref('')
const categories = ref<string[]>([])
const notifications = ref<NewsNotification[]>([])
const unreadCount = ref(0)
const notificationLoading = ref(false)
const notificationActionPending = ref(false)
const notificationError = ref('')
const notificationMenuOpen = ref(false)
const accountMenuOpen = ref(false)
const headerMenus = ref<HTMLElement | null>(null)

const mobileSearchInput = ref<HTMLInputElement | null>(null)

const drawerOpen = ref(false)
const showMobileCategories = ref(false)
let notificationTimer: number | undefined

const accountInitial = computed(() => auth.userName?.trim().charAt(0).toUpperCase() || 'N')
const roleLabel = computed(() => ({
  MEMBER: 'Người đọc',
  VIP: 'Thành viên VIP',
  AUTHOR: 'Tác giả',
  CENSOR: 'Kiểm duyệt viên',
  ADMIN: 'Quản trị viên',
}[auth.role ?? 'MEMBER']))

function openSearchDrawer() {
  drawerOpen.value = true
  setTimeout(() => {
    mobileSearchInput.value?.focus()
  }, 200)
}

onMounted(() => {
  void loadCategories()
  if (auth.isLoggedIn) {
    void loadUnreadCount()
  }
  document.addEventListener('click', closeHeaderMenus)
  notificationTimer = window.setInterval(() => {
    if (auth.isLoggedIn) void loadUnreadCount()
  }, 60_000)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeHeaderMenus)
  if (notificationTimer !== undefined) window.clearInterval(notificationTimer)
})

watch(() => route.fullPath, () => {
  searchQuery.value = ''
  notificationMenuOpen.value = false
  accountMenuOpen.value = false
})

watch(() => auth.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    void loadUnreadCount()
  } else {
    notifications.value = []
    unreadCount.value = 0
    notificationMenuOpen.value = false
    accountMenuOpen.value = false
  }
})

watch(drawerOpen, (val) => {
  if (!val) showMobileCategories.value = false
})

async function loadCategories() {
  try {
    const response = await fetchCategories()
    categories.value = response.map(category => category.name)
  } catch {
    categories.value = []
  }
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    drawerOpen.value = false // Đóng sidebar sau khi tìm kiếm
  }
}

function toggleAccountMenu() {
  accountMenuOpen.value = !accountMenuOpen.value
  notificationMenuOpen.value = false
}

function toggleNotificationMenu() {
  notificationMenuOpen.value = !notificationMenuOpen.value
  accountMenuOpen.value = false
  if (notificationMenuOpen.value) void loadNotifications()
}

function closeHeaderMenus(event: MouseEvent) {
  const target = event.target as Node | null
  if (target && headerMenus.value?.contains(target)) return
  notificationMenuOpen.value = false
  accountMenuOpen.value = false
}

async function loadUnreadCount() {
  try {
    unreadCount.value = await fetchUnreadNotificationCount()
  } catch {
    // Keep the header usable when the notification service is temporarily unavailable.
  }
}

async function loadNotifications() {
  notificationLoading.value = true
  notificationError.value = ''
  try {
    const [items, totalUnread] = await Promise.all([
      fetchNotifications(),
      fetchUnreadNotificationCount(),
    ])
    notifications.value = items
    unreadCount.value = totalUnread
  } catch (error: any) {
    notificationError.value = error?.response?.data?.message ?? 'Không thể tải thông báo.'
  } finally {
    notificationLoading.value = false
  }
}

async function handleMarkAllRead() {
  notificationActionPending.value = true
  try {
    await markAllNotificationsRead()
    notifications.value = notifications.value.map(item => ({ ...item, read: true }))
    unreadCount.value = 0
  } catch (error: any) {
    notificationError.value = error?.response?.data?.message ?? 'Không thể cập nhật thông báo.'
  } finally {
    notificationActionPending.value = false
  }
}

async function openNotification(item: NewsNotification) {
  if (!item.read) {
    notifications.value = notifications.value.map(current => (
      current.id === item.id ? { ...current, read: true } : current
    ))
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    try {
      await markNotificationRead(item.id)
    } catch {
      void loadUnreadCount()
    }
  }
  notificationMenuOpen.value = false
  await router.push(notificationTarget(item))
}

function notificationTarget(item: NewsNotification) {
  if (item.type === 'ADMIN_REVIEW_REQUIRED') return '/admin/posts/approval'
  if (['ARTICLE_APPROVED', 'ARTICLE_REJECTED', 'AUTHOR_ARTICLE_HOT'].includes(item.type)) {
    return '/admin/posts/manage'
  }
  return `/article/${item.articleId}`
}

function formatNotificationTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000))
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

function handleLogout() {
  notificationMenuOpen.value = false
  accountMenuOpen.value = false
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@keyframes slide-in {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in 0.25s cubic-bezier(0.4,0,0.2,1);
}
/* Responsive sidebar: thu nhỏ chữ, padding, gap khi màn hình nhỏ hoặc không đủ chỗ */
@media (max-height: 600px) {
  nav.animate-slide-in {
    font-size: 0.95rem;
    gap: 0.5rem !important;
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }
  nav.animate-slide-in .py-3 {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }
  nav.animate-slide-in .px-2 {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
  nav.animate-slide-in .text-base {
    font-size: 0.98rem !important;
  }
  nav.animate-slide-in .mb-4, nav.animate-slide-in .mb-6 {
    margin-bottom: 0.5rem !important;
  }
}

@media (max-height: 480px) {
  nav.animate-slide-in {
    font-size: 0.85rem;
    gap: 0.25rem !important;
    padding-top: 0.25rem !important;
    padding-bottom: 0.25rem !important;
  }
  nav.animate-slide-in .py-3 {
    padding-top: 0.25rem !important;
    padding-bottom: 0.25rem !important;
  }
  nav.animate-slide-in .px-2 {
    padding-left: 0.25rem !important;
    padding-right: 0.25rem !important;
  }
  nav.animate-slide-in .text-base {
    font-size: 0.9rem !important;
  }
  nav.animate-slide-in .mb-4, nav.animate-slide-in .mb-6 {
    margin-bottom: 0.25rem !important;
  }
}
</style>
