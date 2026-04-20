<template>
  <div class="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900">Chào mừng trở lại</h1>
        <p class="mt-2 text-sm text-gray-600">Đăng nhập để tiếp tục đọc tin tức</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Email</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              v-model="email"
              type="email"
              placeholder="Nhập email"
              class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Nhập mật khẩu"
              class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <EyeOff v-if="showPassword" class="h-5 w-5" />
              <Eye v-else class="h-5 w-5" />
            </button>
          </div>
          <p v-if="errorMsg" class="mt-2 text-sm text-red-600">{{ errorMsg }}</p>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input id="remember" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label for="remember" class="ml-2 block text-sm text-gray-700">Ghi nhớ đăng nhập</label>
          </div>
          <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-500">Quên mật khẩu?</a>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-gray-600">
        Chưa có tài khoản?
        <RouterLink to="/register" class="font-semibold text-blue-600 hover:text-blue-500">Đăng ký ngay</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const loading = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = (router.currentRoute.value.query.redirect as string) || null
    if (redirect) {
      router.push(redirect)
    } else if (auth.isAdmin) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message ?? 'Email hoặc mật khẩu không đúng.'
  } finally {
    loading.value = false
  }
}
</script>
