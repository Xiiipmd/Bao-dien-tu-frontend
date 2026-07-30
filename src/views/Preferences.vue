<template>
  <div class="min-h-[70vh] bg-gradient-to-b from-blue-50/70 to-white">
    <div class="container mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <RouterLink to="/" class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-700">
        <ArrowLeft class="h-4 w-4" /> Về trang chủ
      </RouterLink>

      <div class="mb-8">
        <span class="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
          Dành riêng cho bạn
        </span>
        <h1 class="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Chọn tin bạn thực sự quan tâm</h1>
        <p class="mt-3 max-w-2xl text-gray-600">
          NewsDaily sẽ đưa các chủ đề đã chọn lên đầu trang chủ và gửi thông báo tin mới, tin hot phù hợp qua website và email tài khoản.
        </p>
      </div>

      <div v-if="loading" class="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
        Đang tải tùy chọn...
      </div>

      <template v-else>
        <section class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div class="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Chủ đề yêu thích</h2>
              <p class="mt-1 text-sm text-gray-500">Chọn một hoặc nhiều chủ đề để đồng thời đăng ký nhận email khi chuyên mục có bài mới.</p>
            </div>
            <span class="text-sm font-semibold text-blue-700">{{ selectedIds.size }} chủ đề đã chọn</span>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <button
              v-for="(category, index) in categories"
              :key="category.id"
              type="button"
              class="group flex min-h-24 flex-col items-start justify-between rounded-xl border p-4 text-left transition"
              :class="selectedIds.has(category.id)
                ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-100'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/40'"
              @click="toggleCategory(category.id)"
            >
              <component :is="topicIcons[index % topicIcons.length]" class="h-5 w-5" :class="selectedIds.has(category.id) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'" />
              <span class="flex w-full items-center justify-between gap-2 font-bold">
                {{ category.name }}
                <CheckCircle2 v-if="selectedIds.has(category.id)" class="h-4 w-4 shrink-0 text-blue-600" />
              </span>
            </button>
          </div>
        </section>

        <section class="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex gap-4">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <BellRing class="h-5 w-5" />
              </span>
              <div>
                <h2 class="font-bold text-gray-900">Thông báo tin mới và tin hot</h2>
                <p class="mt-1 text-sm text-gray-500">Nhận thông báo trong NewsDaily và trên thiết bị khi đang mở trang.</p>
                <button
                  v-if="pushEnabled && browserPermission === 'default'"
                  type="button"
                  class="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800"
                  @click="requestBrowserPermission"
                >
                  Cho phép thông báo trên thiết bị
                </button>
                <p v-if="browserPermission === 'denied'" class="mt-2 text-xs font-medium text-red-600">
                  Trình duyệt đang chặn thông báo. Hãy cấp lại quyền trong cài đặt trang web.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="pushEnabled"
              class="relative h-7 w-12 shrink-0 rounded-full transition"
              :class="pushEnabled ? 'bg-blue-600' : 'bg-gray-300'"
              @click="togglePush"
            >
              <span class="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition" :class="pushEnabled ? 'left-6' : 'left-1'" />
            </button>
          </div>
        </section>

        <div class="mt-6 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
          <p class="text-sm" :class="saveStatus === 'error' ? 'text-red-600' : 'text-emerald-600'">{{ statusMessage }}</p>
          <button
            type="button"
            :disabled="saving"
            class="inline-flex min-w-44 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            @click="save"
          >
            <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
            <Save v-else class="h-4 w-4" />
            {{ saving ? 'Đang lưu...' : 'Lưu tùy chọn' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  ArrowLeft,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  Cpu,
  Earth,
  HeartPulse,
  Landmark,
  LoaderCircle,
  Save,
  Sparkles,
  Trophy,
} from 'lucide-vue-next'
import { fetchCategories, type CategoryOption } from '@/api/articles'
import { fetchPreferences, updatePreferences } from '@/api/personalization'

const topicIcons = [Earth, Cpu, BriefcaseBusiness, Trophy, HeartPulse, Landmark, Sparkles]
const categories = ref<CategoryOption[]>([])
const selectedIds = ref(new Set<number>())
const pushEnabled = ref(true)
const loading = ref(true)
const saving = ref(false)
const saveStatus = ref<'idle' | 'success' | 'error'>('idle')
const statusMessage = ref('')
const browserPermission = ref<NotificationPermission | 'unsupported'>(
  'Notification' in window ? Notification.permission : 'unsupported',
)

onMounted(load)

async function load() {
  try {
    const [allCategories, preferences] = await Promise.all([fetchCategories(), fetchPreferences()])
    categories.value = allCategories
    selectedIds.value = new Set(preferences.selectedTopics.map(topic => topic.id))
    pushEnabled.value = preferences.pushNotificationsEnabled
  } catch (error: any) {
    saveStatus.value = 'error'
    statusMessage.value = error?.response?.data?.message ?? 'Không thể tải tùy chọn. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

function toggleCategory(categoryId: number) {
  const next = new Set(selectedIds.value)
  next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId)
  selectedIds.value = next
  clearStatus()
}

async function togglePush() {
  if (!pushEnabled.value && 'Notification' in window && Notification.permission === 'default') {
    await requestBrowserPermission()
  }
  pushEnabled.value = !pushEnabled.value
  clearStatus()
}

async function requestBrowserPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    browserPermission.value = await Notification.requestPermission()
  }
}

async function save() {
  saving.value = true
  clearStatus()
  try {
    const result = await updatePreferences([...selectedIds.value], pushEnabled.value)
    selectedIds.value = new Set(result.selectedTopics.map(topic => topic.id))
    pushEnabled.value = result.pushNotificationsEnabled
    saveStatus.value = 'success'
    statusMessage.value = 'Đã lưu. Trang chủ và thông báo của bạn đã được cá nhân hóa.'
    window.dispatchEvent(new Event('news-preferences-updated'))
  } catch (error: any) {
    saveStatus.value = 'error'
    statusMessage.value = error?.response?.data?.message ?? 'Lưu tùy chọn không thành công.'
  } finally {
    saving.value = false
  }
}

function clearStatus() {
  saveStatus.value = 'idle'
  statusMessage.value = ''
}
</script>
