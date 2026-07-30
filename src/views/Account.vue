<template>
  <div class="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white">
    <div class="container mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <RouterLink to="/" class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-700">
        <ArrowLeft class="h-4 w-4" /> Về trang chủ
      </RouterLink>

      <div v-if="loading" class="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-500 shadow-sm">
        Đang tải thông tin tài khoản...
      </div>

      <template v-else-if="profile">
        <section class="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white shadow-lg md:p-8">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl font-black ring-1 ring-white/20">
              {{ avatarLetters }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="truncate text-2xl font-black md:text-3xl">{{ profile.fullName }}</h1>
                <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{{ roleLabel(profile.role) }}</span>
              </div>
              <p class="mt-1 text-blue-100">{{ profile.email }}</p>
              <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-blue-100">
                <span v-if="profile.createdAt">Tham gia {{ formatDate(profile.createdAt) }}</span>
                <span v-if="profile.vipExpiryDate">VIP đến {{ formatDate(profile.vipExpiryDate) }}</span>
              </div>
            </div>
          </div>
        </section>

        <div class="grid gap-6 lg:grid-cols-2">
          <section class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div class="mb-6 flex items-start gap-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <UserRound class="h-5 w-5" />
              </span>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
                <p class="mt-1 text-sm text-gray-500">Email mới sẽ được dùng để đăng nhập và nhận thông báo.</p>
              </div>
            </div>

            <form class="space-y-5" @submit.prevent="saveProfile">
              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-gray-700">Họ và tên</span>
                <span class="relative block">
                  <UserRound class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    v-model.trim="profileForm.fullName"
                    required
                    maxlength="255"
                    autocomplete="name"
                    class="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </span>
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-gray-700">Email</span>
                <span class="relative block">
                  <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    v-model.trim="profileForm.email"
                    required
                    type="email"
                    maxlength="255"
                    autocomplete="email"
                    class="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </span>
              </label>

              <p v-if="profileMessage" class="rounded-lg px-3 py-2 text-sm" :class="profileError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'">
                {{ profileMessage }}
              </p>

              <button
                type="submit"
                :disabled="profileSaving"
                class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LoaderCircle v-if="profileSaving" class="h-4 w-4 animate-spin" />
                <Save v-else class="h-4 w-4" />
                {{ profileSaving ? 'Đang lưu...' : 'Lưu thông tin' }}
              </button>
            </form>
          </section>

          <section class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <div class="mb-6 flex items-start gap-3">
              <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <LockKeyhole class="h-5 w-5" />
              </span>
              <div>
                <h2 class="text-xl font-bold text-gray-900">Đổi mật khẩu</h2>
                <p class="mt-1 text-sm text-gray-500">Mật khẩu mới cần có tối thiểu 8 ký tự.</p>
              </div>
            </div>

            <form class="space-y-4" @submit.prevent="savePassword">
              <label v-for="field in passwordFields" :key="field.key" class="block">
                <span class="mb-2 block text-sm font-semibold text-gray-700">{{ field.label }}</span>
                <span class="relative block">
                  <LockKeyhole class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    v-model="passwordForm[field.key]"
                    required
                    :minlength="field.key === 'currentPassword' ? undefined : 8"
                    :autocomplete="field.key === 'currentPassword' ? 'current-password' : 'new-password'"
                    :type="showPasswords[field.key] ? 'text' : 'password'"
                    class="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-11 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    :aria-label="showPasswords[field.key] ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                    @click="showPasswords[field.key] = !showPasswords[field.key]"
                  >
                    <EyeOff v-if="showPasswords[field.key]" class="h-4 w-4" />
                    <Eye v-else class="h-4 w-4" />
                  </button>
                </span>
              </label>

              <p v-if="passwordMessage" class="rounded-lg px-3 py-2 text-sm" :class="passwordError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'">
                {{ passwordMessage }}
              </p>

              <button
                type="submit"
                :disabled="passwordSaving"
                class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LoaderCircle v-if="passwordSaving" class="h-4 w-4 animate-spin" />
                <ShieldCheck v-else class="h-4 w-4" />
                {{ passwordSaving ? 'Đang cập nhật...' : 'Đổi mật khẩu' }}
              </button>
            </form>
          </section>
        </div>
      </template>

      <div v-else class="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        {{ loadError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-vue-next'
import { changeUserPassword, fetchUserProfile, updateUserProfile, type UserProfile } from '@/api/account'
import { useAuthStore } from '@/stores/auth'

type PasswordKey = 'currentPassword' | 'newPassword' | 'confirmation'

const auth = useAuthStore()
const profile = ref<UserProfile | null>(null)
const loading = ref(true)
const loadError = ref('')
const profileSaving = ref(false)
const profileMessage = ref('')
const profileError = ref(false)
const passwordSaving = ref(false)
const passwordMessage = ref('')
const passwordError = ref(false)

const profileForm = reactive({ fullName: '', email: '' })
const passwordForm = reactive<Record<PasswordKey, string>>({
  currentPassword: '',
  newPassword: '',
  confirmation: '',
})
const showPasswords = reactive<Record<PasswordKey, boolean>>({
  currentPassword: false,
  newPassword: false,
  confirmation: false,
})
const passwordFields: Array<{ key: PasswordKey; label: string }> = [
  { key: 'currentPassword', label: 'Mật khẩu hiện tại' },
  { key: 'newPassword', label: 'Mật khẩu mới' },
  { key: 'confirmation', label: 'Xác nhận mật khẩu mới' },
]

const avatarLetters = computed(() => profile.value?.fullName
  .split(/\s+/)
  .filter(Boolean)
  .slice(-2)
  .map(part => part[0]?.toUpperCase())
  .join('') || 'ND')

onMounted(loadProfile)

async function loadProfile() {
  try {
    profile.value = await fetchUserProfile()
    profileForm.fullName = profile.value.fullName
    profileForm.email = profile.value.email
  } catch (error: any) {
    loadError.value = error?.response?.data?.message ?? 'Không thể tải thông tin tài khoản.'
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  profileMessage.value = ''
  profileError.value = false
  if (!profileForm.fullName || !profileForm.email) return
  profileSaving.value = true
  try {
    profile.value = await updateUserProfile(profileForm)
    auth.updateUserName(profile.value.fullName)
    profileForm.fullName = profile.value.fullName
    profileForm.email = profile.value.email
    profileMessage.value = 'Thông tin cá nhân đã được cập nhật.'
  } catch (error: any) {
    profileError.value = true
    profileMessage.value = error?.response?.data?.message ?? 'Cập nhật thông tin không thành công.'
  } finally {
    profileSaving.value = false
  }
}

async function savePassword() {
  passwordMessage.value = ''
  passwordError.value = false
  if (passwordForm.newPassword !== passwordForm.confirmation) {
    passwordError.value = true
    passwordMessage.value = 'Xác nhận mật khẩu mới không khớp.'
    return
  }
  passwordSaving.value = true
  try {
    await changeUserPassword(passwordForm)
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmation = ''
    passwordMessage.value = 'Mật khẩu đã được thay đổi thành công.'
  } catch (error: any) {
    passwordError.value = true
    passwordMessage.value = error?.response?.data?.message ?? 'Không thể đổi mật khẩu.'
  } finally {
    passwordSaving.value = false
  }
}

function roleLabel(role: string) {
  return {
    VIP: 'Hội viên VIP',
    MEMBER: 'Thành viên',
    AUTHOR: 'Tác giả',
    CENSOR: 'Kiểm duyệt viên',
    ADMIN: 'Quản trị viên',
  }[role] ?? role
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}
</script>
