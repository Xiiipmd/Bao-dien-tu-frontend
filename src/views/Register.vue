<template>
  <div class="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
        <p class="mt-2 text-sm text-gray-600">Đăng ký để trải nghiệm đầy đủ tính năng</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Họ và tên</label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              v-model="form.name"
              type="text"
              placeholder="Nhập họ và tên"
              :class="['w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1', errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500']"
            />
          </div>
          <p v-if="errors.name" class="mt-1.5 text-xs text-red-600">{{ errors.name }}</p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Email</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              v-model="form.email"
              type="email"
              placeholder="Nhập địa chỉ email"
              required
              class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Nhập mật khẩu"
              :class="['w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-1', errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500']"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <EyeOff v-if="showPassword" class="h-5 w-5" />
              <Eye v-else class="h-5 w-5" />
            </button>
          </div>
          <p v-if="errors.password" class="mt-1.5 text-xs text-red-600">{{ errors.password }}</p>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              v-model="form.confirmation"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Nhập lại mật khẩu"
              :class="['w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1', errors.confirmation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500']"
            />
          </div>
          <p v-if="errors.confirmation" class="mt-1.5 text-xs text-red-600">{{ errors.confirmation }}</p>
        </div>

        <p v-if="serverError" class="text-sm text-red-600 text-center">{{ serverError }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
        </button>
      </form>

      <p class="mt-8 text-center text-sm text-gray-600">
        Đã có tài khoản?
        <RouterLink to="/login" class="font-semibold text-blue-600 hover:text-blue-500">Đăng nhập</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const showPassword = ref(false)
const loading = ref(false)
const serverError = ref('')
const form = reactive({ name: '', email: '', password: '', confirmation: '' })
const errors = reactive<Record<string, string>>({})

async function handleSubmit() {
  Object.assign(errors, { name: '', password: '', confirmation: '' })
  serverError.value = ''

  if (!form.name || form.name.length < 2) {
    errors.name = 'Họ tên phải có ít nhất 2 ký tự'
  }
  if (form.password.length < 8) {
    errors.password = 'Mật khẩu phải có ít nhất 8 ký tự'
  }
  if (form.password !== form.confirmation) {
    errors.confirmation = 'Mật khẩu xác nhận không khớp'
  }
  if (errors.name || errors.password || errors.confirmation) return

  loading.value = true
  try {
    await auth.register({
      email: form.email,
      name: form.name,
      password: form.password,
      confirmation: form.confirmation,
    })
    router.push('/login')
  } catch (err: any) {
    serverError.value = err?.response?.data?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>
