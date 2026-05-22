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
            <span class="text-sm font-semibold text-gray-700 hover:text-blue-600">Danh mục</span>
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
            <Crown class="h-4 w-4" /> VIP
          </RouterLink>
        </nav>

        <!-- Search & Actions -->
        <div class="flex items-center gap-4">
          <form @submit.prevent="handleSearch" class="hidden md:flex relative items-center">
            <Search class="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm bài viết..."
              class="h-10 w-64 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </form>

          <div class="flex items-center gap-3">
            <template v-if="auth.isLoggedIn">
              <div class="hidden md:flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                <User class="h-4 w-4 text-gray-500" />
                <span class="text-sm font-semibold text-gray-700">{{ auth.userName }}</span>
                <Crown v-if="auth.isVip" class="h-4 w-4 text-amber-500" title="Thành viên VIP" />
              </div>
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

            <RouterLink v-if="auth.isStaff" to="/admin" class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full" title="Khu vực nghiệp vụ">
              <User class="h-5 w-5" />
            </RouterLink>

            <button class="md:hidden p-2 text-gray-600">
              <Menu class="h-6 w-6" />
            </button>
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
            Nguồn tin tức uy tín, cập nhật nhanh chóng những diễn biến mới nhất về công nghệ, kinh doanh và đời sống.
          </p>
        </div>
        <div>
          <h4 class="font-bold text-gray-900 mb-4">Thông tin</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li><a href="#" class="hover:text-blue-600">Về chúng tôi</a></li>
            <li><a href="#" class="hover:text-blue-600">Tuyển dụng</a></li>
            <li><a href="#" class="hover:text-blue-600">Điều khoản sử dụng</a></li>
            <li><a href="#" class="hover:text-blue-600">Chính sách bảo mật</a></li>
          </ul>
        </div>
        <div>
          <h4 class="font-bold text-gray-900 mb-4">Liên hệ</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>Email: contact@newsdaily.vn</li>
            <li>SĐT: (028) 3812 3456</li>
            <li>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
          </ul>
        </div>
      </div>
      <div class="container mx-auto px-4 lg:px-8 mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
        © {{ new Date().getFullYear() }} NewsDaily. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Crown, Menu, User, LogOut } from 'lucide-vue-next'
import { fetchCategories } from '@/api/articles'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const searchQuery = ref('')
const categories = ref<string[]>([])

onMounted(loadCategories)

watch(() => route.fullPath, () => {
  searchQuery.value = ''
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
  }
}

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>
