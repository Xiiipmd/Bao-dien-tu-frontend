<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-10 lg:px-8">
    <div v-if="loading" class="flex min-h-[55vh] items-center justify-center text-sm text-slate-500">
      Đang tải thông tin tài khoản...
    </div>

    <div v-else-if="loadError" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
      <p class="font-semibold">Không thể tải tài khoản</p>
      <p class="mt-1 text-sm">{{ loadError }}</p>
      <button type="button" class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white" @click="loadProfile">
        Thử lại
      </button>
    </div>

    <template v-else-if="profile">
      <section class="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
        <div class="grid gap-8 px-6 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-10">
          <div class="flex min-w-0 items-center gap-5">
            <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/15 bg-blue-600 text-3xl font-black">
              <img
                v-if="displayAvatar && !avatarFailed"
                :src="displayAvatar"
                :alt="profile.fullName"
                class="h-full w-full object-cover"
                @error="avatarFailed = true"
              />
              <span v-else>{{ accountInitial }}</span>
            </div>
            <div class="min-w-0">
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-100">
                  {{ roleLabel }}
                </span>
                <span v-if="hasActiveVip" class="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-950">
                  VIP đang hoạt động
                </span>
              </div>
              <h1 class="truncate text-3xl font-black tracking-tight md:text-4xl">{{ profile.fullName }}</h1>
              <p class="mt-2 truncate text-sm text-slate-300">{{ profile.email }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-3 md:justify-end">
            <RouterLink
              :to="`/user/${profile.id}`"
              class="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <UserRound class="h-4 w-4" /> Hồ sơ công khai
            </RouterLink>
            <RouterLink
              v-if="isStaff"
              to="/admin"
              class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-blue-50"
            >
              <BriefcaseBusiness class="h-4 w-4" /> Khu vực làm việc
            </RouterLink>
          </div>
        </div>
      </section>

      <div class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div class="space-y-8">
          <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div class="mb-6">
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Thông tin cá nhân</p>
              <h2 class="mt-2 text-2xl font-bold text-slate-950">Chỉnh sửa hồ sơ</h2>
              <p class="mt-1 text-sm text-slate-500">Thông tin này được đồng bộ cho cả web và ứng dụng.</p>
            </div>

            <form class="grid gap-5" @submit.prevent="saveProfile">
              <div class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xl font-black text-white">
                  <img v-if="displayAvatar && !avatarFailed" :src="displayAvatar" :alt="profile.fullName" class="h-full w-full object-cover" @error="avatarFailed = true" />
                  <span v-else>{{ accountInitial }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold text-slate-900">Ảnh đại diện</p>
                  <p class="mt-1 text-xs leading-5 text-slate-500">Chọn ảnh JPEG, PNG hoặc WebP, dung lượng tối đa 5 MB.</p>
                  <p v-if="selectedAvatarFile" class="mt-1 truncate text-xs font-semibold text-blue-600">Đã chọn: {{ selectedAvatarFile.name }}</p>
                </div>
                <input ref="avatarInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleAvatarFile" />
                <button type="button" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700" @click="avatarInput?.click()">
                  <Camera class="h-4 w-4" /> Chọn ảnh
                </button>
              </div>
              <label class="text-sm font-semibold text-slate-700">
                <span class="mb-2 block">Họ và tên</span>
                <input v-model="profileForm.fullName" maxlength="255" class="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label class="text-sm font-semibold text-slate-700">
                <span class="mb-2 block">Email</span>
                <input v-model="profileForm.email" type="email" maxlength="255" class="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <p v-if="profileMessage" :class="profileMessageType === 'success' ? 'text-emerald-700' : 'text-red-600'" class="text-sm font-medium">
                {{ profileMessage }}
              </p>
              <div>
                <button :disabled="profileSaving" type="submit" class="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {{ profileSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>
              </div>
            </form>
          </section>

          <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div class="mb-6">
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Bảo mật</p>
              <h2 class="mt-2 text-2xl font-bold text-slate-950">Đổi mật khẩu</h2>
            </div>
            <form class="grid gap-5 md:grid-cols-2" @submit.prevent="savePassword">
              <label class="text-sm font-semibold text-slate-700 md:col-span-2">
                <span class="mb-2 block">Mật khẩu hiện tại</span>
                <input v-model="passwordForm.currentPassword" type="password" autocomplete="current-password" class="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label class="text-sm font-semibold text-slate-700">
                <span class="mb-2 block">Mật khẩu mới</span>
                <input v-model="passwordForm.newPassword" type="password" minlength="8" autocomplete="new-password" class="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label class="text-sm font-semibold text-slate-700">
                <span class="mb-2 block">Xác nhận mật khẩu</span>
                <input v-model="passwordForm.confirmation" type="password" minlength="8" autocomplete="new-password" class="w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <p v-if="passwordMessage" :class="passwordMessageType === 'success' ? 'text-emerald-700' : 'text-red-600'" class="text-sm font-medium md:col-span-2">
                {{ passwordMessage }}
              </p>
              <div class="md:col-span-2">
                <button :disabled="passwordSaving" type="submit" class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                  {{ passwordSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside class="space-y-5">
          <section v-if="isReader" class="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <Crown class="h-7 w-7 text-amber-600" />
            <h2 class="mt-4 text-xl font-bold text-slate-950">Quyền đọc VIP</h2>
            <p v-if="hasActiveVip" class="mt-2 text-sm leading-6 text-slate-600">
              Gói VIP có hiệu lực đến {{ formatDate(profile.vipExpiryDate) }}.
            </p>
            <p v-else class="mt-2 text-sm leading-6 text-slate-600">
              Bạn còn {{ profile.freeArticlesLeft }} lượt đọc bài VIP miễn phí trong tháng này.
            </p>
            <RouterLink to="/vip" class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800">
              {{ hasActiveVip ? 'Xem quyền lợi' : 'Xem các gói VIP' }} <ArrowRight class="h-4 w-4" />
            </RouterLink>
          </section>

          <section v-else class="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <BriefcaseBusiness class="h-7 w-7 text-blue-600" />
            <h2 class="mt-4 text-xl font-bold text-slate-950">{{ roleLabel }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ staffDescription }}</p>
            <RouterLink to="/admin" class="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800">
              Mở khu vực làm việc <ArrowRight class="h-4 w-4" />
            </RouterLink>
          </section>

          <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Tài khoản</p>
            <dl class="mt-4 space-y-4 text-sm">
              <div class="flex items-center justify-between gap-4">
                <dt class="text-slate-500">Mã tài khoản</dt>
                <dd class="font-semibold text-slate-900">#{{ profile.id }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-slate-500">Ngày tham gia</dt>
                <dd class="font-semibold text-slate-900">{{ formatDate(profile.createdAt) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4">
                <dt class="text-slate-500">Vai trò</dt>
                <dd class="font-semibold text-slate-900">{{ roleLabel }}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ArrowRight, BriefcaseBusiness, Camera, Crown, UserRound } from 'lucide-vue-next'
import {
  changeAccountPassword,
  fetchAccountProfile,
  uploadAccountAvatar,
  updateAccountAvatar,
  updateAccountProfile,
  type AccountProfile,
} from '@/api/account'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const profile = ref<AccountProfile | null>(null)
const loading = ref(true)
const loadError = ref('')
const avatarFailed = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const selectedAvatarFile = ref<File | null>(null)
const avatarPreviewUrl = ref('')
const profileSaving = ref(false)
const passwordSaving = ref(false)
const profileMessage = ref('')
const profileMessageType = ref<'success' | 'error'>('success')
const passwordMessage = ref('')
const passwordMessageType = ref<'success' | 'error'>('success')

const profileForm = reactive({ fullName: '', email: '' })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmation: '' })

const isReader = computed(() => profile.value?.role === 'MEMBER' || profile.value?.role === 'VIP')
const isStaff = computed(() => ['AUTHOR', 'CENSOR', 'ADMIN'].includes(profile.value?.role ?? ''))
const hasActiveVip = computed(() => Boolean(
  profile.value?.vipExpiryDate && new Date(profile.value.vipExpiryDate).getTime() > Date.now(),
))
const accountInitial = computed(() => profile.value?.fullName.trim().charAt(0).toUpperCase() || 'N')
const displayAvatar = computed(() => avatarPreviewUrl.value || profile.value?.avatar || '')
const roleLabel = computed(() => ({
  MEMBER: 'Người đọc',
  VIP: 'Thành viên VIP',
  AUTHOR: 'Tác giả',
  CENSOR: 'Kiểm duyệt viên',
  ADMIN: 'Quản trị viên',
}[profile.value?.role ?? 'MEMBER']))
const staffDescription = computed(() => {
  switch (profile.value?.role) {
    case 'CENSOR':
      return 'Kiểm tra các bài đang chờ và phản hồi cho tác giả.'
    case 'ADMIN':
      return 'Quản lý người dùng, xuất bản, gói VIP và thống kê hệ thống.'
    default:
      return 'Soạn bài, gửi duyệt và theo dõi hiệu quả nội dung của bạn.'
  }
})

onMounted(loadProfile)
onBeforeUnmount(clearAvatarPreview)

async function loadProfile() {
  loading.value = true
  loadError.value = ''
  try {
    applyProfile(await fetchAccountProfile())
  } catch (error: any) {
    loadError.value = getErrorMessage(error, 'Không thể tải thông tin tài khoản.')
  } finally {
    loading.value = false
  }
}

function applyProfile(value: AccountProfile) {
  profile.value = value
  profileForm.fullName = value.fullName
  profileForm.email = value.email
  selectedAvatarFile.value = null
  clearAvatarPreview()
  avatarFailed.value = false
}

function handleAvatarFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showProfileMessage('Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.', 'error')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    showProfileMessage('Ảnh đại diện không được vượt quá 5 MB.', 'error')
    return
  }

  clearAvatarPreview()
  selectedAvatarFile.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
  avatarFailed.value = false
  profileMessage.value = ''
}

function clearAvatarPreview() {
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  avatarPreviewUrl.value = ''
}

async function saveProfile() {
  profileMessage.value = ''
  if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
    showProfileMessage('Họ tên và email không được để trống.', 'error')
    return
  }

  profileSaving.value = true
  try {
    let updated = await updateAccountProfile({
      fullName: profileForm.fullName.trim(),
      email: profileForm.email.trim(),
    })
    if (selectedAvatarFile.value) {
      const uploaded = await uploadAccountAvatar(selectedAvatarFile.value)
      updated = await updateAccountAvatar(uploaded.path)
    }
    applyProfile(updated)
    await auth.refreshSession()
    showProfileMessage('Đã cập nhật hồ sơ trên web và ứng dụng.', 'success')
  } catch (error: any) {
    showProfileMessage(getErrorMessage(error, 'Không thể cập nhật hồ sơ.'), 'error')
  } finally {
    profileSaving.value = false
  }
}

async function savePassword() {
  passwordMessage.value = ''
  if (!passwordForm.currentPassword || passwordForm.newPassword.length < 8) {
    showPasswordMessage('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmation) {
    showPasswordMessage('Xác nhận mật khẩu mới không khớp.', 'error')
    return
  }

  passwordSaving.value = true
  try {
    await changeAccountPassword({ ...passwordForm })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmation = ''
    showPasswordMessage('Đã cập nhật mật khẩu.', 'success')
  } catch (error: any) {
    showPasswordMessage(getErrorMessage(error, 'Không thể cập nhật mật khẩu.'), 'error')
  } finally {
    passwordSaving.value = false
  }
}

function showProfileMessage(message: string, type: 'success' | 'error') {
  profileMessage.value = message
  profileMessageType.value = type
}

function showPasswordMessage(message: string, type: 'success' | 'error') {
  passwordMessage.value = message
  passwordMessageType.value = type
}

function getErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message ?? fallback
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}
</script>
