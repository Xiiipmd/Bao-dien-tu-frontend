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
          <RouterLink to="/vip" class="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700">
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

          <button
            type="button"
            class="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
            :title="isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
            :aria-label="isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
            @click="toggleTheme"
          >
            <Sun v-if="isDark" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </button>

          <div class="flex items-center gap-3">
            <template v-if="auth.isLoggedIn">
              <NotificationBell />
              <RouterLink
                to="/preferences"
                class="hidden rounded-full p-2 text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 md:flex"
                title="Cá nhân hóa chủ đề"
              >
                <Settings2 class="h-5 w-5" />
              </RouterLink>
              <RouterLink
                to="/account"
                class="hidden items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 transition hover:border-blue-200 hover:bg-blue-50 md:flex"
                title="Thông tin tài khoản"
              >
                <User class="h-4 w-4 text-gray-500" />
                <span class="text-sm font-semibold text-gray-700">{{ auth.userName }}</span>
                <Crown v-if="auth.isVip" class="h-4 w-4 text-amber-500" title="Thành viên VIP" />
              </RouterLink>
              <button
                @click="handleLogout"
                class="hidden md:flex items-center justify-center p-2 text-gray-600 hover:text-red-600 rounded-full bg-gray-50 hover:bg-red-50 transition-colors"
                title="Đăng xuất"
              >
                <LogOut class="h-5 w-5" />
              </button>
            </template>
            <template v-else>
              <RouterLink to="/login" class="hidden text-sm font-semibold text-gray-700 hover:text-blue-600 md:block">Đăng nhập</RouterLink>
              <RouterLink to="/register" class="hidden rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 md:block">Đăng ký</RouterLink>
            </template>

            <RouterLink v-if="auth.isStaff" to="/admin" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full" title="Quản trị">
              <User class="h-5 w-5" />
            </RouterLink>

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
                    <RouterLink to="/vip" class="py-3 px-2 rounded text-base font-semibold text-amber-600 hover:bg-amber-50" @click="drawerOpen = false">Hội viên VIP</RouterLink>
                    <div class="border-t border-gray-200 my-2"></div>
                    <template v-if="auth.isLoggedIn">
                      <div class="flex items-center gap-2 py-2">
                        <User class="h-5 w-5 text-gray-500" />
                        <span class="font-semibold text-gray-700">{{ auth.userName }}</span>
                        <Crown v-if="auth.isVip" class="h-5 w-5 text-amber-500" title="Thành viên VIP" />
                      </div>
                      <RouterLink
                        to="/account"
                        class="flex items-center gap-2 rounded px-2 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                        @click="drawerOpen = false"
                      >
                        <User class="h-5 w-5" /> Tài khoản của tôi
                      </RouterLink>
                      <RouterLink
                        to="/preferences"
                        class="flex items-center gap-2 rounded px-2 py-2 font-semibold text-blue-700 hover:bg-blue-50"
                        @click="drawerOpen = false"
                      >
                        <Settings2 class="h-5 w-5" /> Chủ đề &amp; thông báo
                      </RouterLink>
                      <button @click="handleLogout(); drawerOpen = false" class="w-full py-2 px-2 rounded text-left text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut class="h-5 w-5" /> Đăng xuất
                      </button>
                    </template>
                    <template v-else>
                      <RouterLink to="/login" class="py-2 px-2 rounded text-base font-semibold text-gray-700 hover:bg-gray-100" @click="drawerOpen = false">Đăng nhập</RouterLink>
                      <RouterLink to="/register" class="py-2 px-2 rounded text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150" @click="drawerOpen = false">Đăng ký</RouterLink>
                    </template>
                    <RouterLink v-if="auth.isStaff" to="/admin" class="py-2 px-2 rounded text-base font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-2" @click="drawerOpen = false">
                      <User class="h-5 w-5" /> Quản trị
                    </RouterLink>
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
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Crown, Menu, User, LogOut, Settings2, Moon, Sun } from 'lucide-vue-next'
import { fetchCategories } from '@/api/articles'
import { useAuthStore } from '@/stores/auth'
import NotificationBell from '@/components/NotificationBell.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const searchQuery = ref('')
const categories = ref<string[]>([])
const isDark = ref(false)

const mobileSearchInput = ref<HTMLInputElement | null>(null)

const drawerOpen = ref(false)
const showMobileCategories = ref(false)

function openSearchDrawer() {
  drawerOpen.value = true
  setTimeout(() => {
    mobileSearchInput.value?.focus()
  }, 200)
}

onMounted(() => {
  loadCategories()
  const savedTheme = localStorage.getItem('newsdaily-theme')
  isDark.value = savedTheme
    ? savedTheme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme()
})

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
  document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('newsdaily-theme', isDark.value ? 'dark' : 'light')
  applyTheme()
}

watch(() => route.fullPath, () => {
  searchQuery.value = ''
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

function handleLogout() {
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
