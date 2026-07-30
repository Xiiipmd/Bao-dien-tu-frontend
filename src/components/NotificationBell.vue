<template>
  <div ref="rootElement" class="relative">
    <button
      type="button"
      class="relative rounded-full p-2 text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
      :aria-label="`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`"
      @click="togglePanel"
    >
      <Bell class="h-5 w-5" />
      <span
        v-if="unreadCount"
        class="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <Transition name="notification-panel">
      <section
        v-if="panelOpen"
        class="fixed inset-x-3 top-[4.5rem] z-50 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[24rem]"
      >
        <header class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div>
            <h2 class="font-bold text-gray-900">Thông báo</h2>
            <p class="text-xs text-gray-500">{{ unreadCount }} thông báo chưa đọc</p>
          </div>
          <button
            v-if="unreadCount"
            type="button"
            class="text-xs font-semibold text-blue-600 hover:text-blue-800"
            @click="readAll"
          >
            Đánh dấu đã đọc
          </button>
        </header>

        <div v-if="loading" class="p-8 text-center text-sm text-gray-500">Đang tải thông báo...</div>
        <div v-else-if="!notifications.length" class="p-8 text-center">
          <BellOff class="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p class="font-medium text-gray-700">Chưa có thông báo mới</p>
          <p class="mt-1 text-xs text-gray-500">Tin mới và tin hot theo sở thích sẽ xuất hiện tại đây.</p>
        </div>
        <div v-else class="max-h-[28rem] overflow-y-auto">
          <button
            v-for="item in notifications"
            :key="item.id"
            type="button"
            class="flex w-full gap-3 border-b border-gray-50 p-4 text-left transition last:border-0 hover:bg-gray-50"
            :class="{ 'bg-blue-50/60': !item.read }"
            @click="openNotification(item)"
          >
            <img :src="item.articleImage" :alt="item.message" class="h-14 w-20 shrink-0 rounded-lg bg-gray-100 object-cover" />
            <span class="min-w-0 flex-1">
              <span class="mb-1 flex items-center gap-2">
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  :class="notificationBadgeClass(item.type)"
                >
                  {{ notificationLabel(item.type) }}
                </span>
                <span class="truncate text-[11px] text-gray-500">{{ item.categoryName }}</span>
              </span>
              <strong class="line-clamp-2 block text-sm leading-snug text-gray-900">{{ item.message }}</strong>
              <span class="mt-1 block text-[11px] text-gray-400">{{ relativeTime(item.createdAt) }}</span>
            </span>
            <span v-if="!item.read" class="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
          </button>
        </div>

        <RouterLink
          to="/preferences"
          class="flex items-center justify-center gap-1.5 border-t border-gray-100 px-4 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-blue-700"
          @click="panelOpen = false"
        >
          <Settings2 class="h-3.5 w-3.5" />
          Tùy chỉnh chủ đề và thông báo
        </RouterLink>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, BellOff, Settings2 } from 'lucide-vue-next'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NewsNotification,
} from '@/api/personalization'

const router = useRouter()
const rootElement = ref<HTMLElement | null>(null)
const notifications = ref<NewsNotification[]>([])
const loading = ref(false)
const panelOpen = ref(false)
const initialized = ref(false)
let pollingTimer: number | undefined

const unreadCount = computed(() => notifications.value.filter(item => !item.read).length)

onMounted(() => {
  loadNotifications()
  pollingTimer = window.setInterval(loadNotifications, 5_000)
  document.addEventListener('click', closeOnOutsideClick)
  window.addEventListener('news-preferences-updated', loadNotifications)
})

onBeforeUnmount(() => {
  if (pollingTimer) window.clearInterval(pollingTimer)
  document.removeEventListener('click', closeOnOutsideClick)
  window.removeEventListener('news-preferences-updated', loadNotifications)
})

async function loadNotifications() {
  try {
    const nextItems = await fetchNotifications()
    if (initialized.value) {
      const knownIds = new Set(notifications.value.map(item => item.id))
      const newest = nextItems.find(item => !item.read && !knownIds.has(item.id))
      if (newest) showBrowserNotification(newest)
    }
    notifications.value = nextItems
    initialized.value = true
  } catch {
    // The header remains usable if the notification service is temporarily unavailable.
  } finally {
    loading.value = false
  }
}

async function togglePanel() {
  panelOpen.value = !panelOpen.value
  if (panelOpen.value) {
    loading.value = notifications.value.length === 0
    await loadNotifications()
  }
}

async function openNotification(item: NewsNotification) {
  panelOpen.value = false
  if (!item.read) {
    item.read = true
    try {
      await markNotificationRead(item.id)
    } catch {
      item.read = false
    }
  }
  await router.push(notificationTarget(item))
}

async function readAll() {
  const previous = notifications.value.map(item => item.read)
  notifications.value.forEach(item => { item.read = true })
  try {
    await markAllNotificationsRead()
  } catch {
    notifications.value.forEach((item, index) => { item.read = previous[index] })
  }
}

function showBrowserNotification(item: NewsNotification) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const notification = new Notification(item.title, {
    body: item.message,
    icon: item.articleImage,
    tag: `newsdaily-${item.id}`,
  })
  notification.onclick = () => {
    window.focus()
    router.push(notificationTarget(item))
    notification.close()
  }
}

function notificationTarget(item: NewsNotification) {
  if (item.type === 'ADMIN_REVIEW_REQUIRED') {
    return {
      path: '/admin/posts/approval',
      query: { articleId: String(item.articleId) },
    }
  }
  return item.type === 'ARTICLE_REJECTED'
    ? '/admin/posts/manage'
    : `/article/${item.articleId}`
}

function closeOnOutsideClick(event: MouseEvent) {
  if (panelOpen.value && !rootElement.value?.contains(event.target as Node)) {
    panelOpen.value = false
  }
}

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime()
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days} ngày trước` : new Intl.DateTimeFormat('vi-VN').format(new Date(value))
}

function notificationLabel(type: NewsNotification['type']) {
  return {
    ADMIN_REVIEW_REQUIRED: 'Chờ duyệt',
    NEW_ARTICLE: 'Tin mới',
    HOT_ARTICLE: 'Tin hot',
    ARTICLE_APPROVED: 'Đã duyệt',
    ARTICLE_REJECTED: 'Cần sửa',
    AUTHOR_ARTICLE_HOT: 'Bài đang hot',
  }[type]
}

function notificationBadgeClass(type: NewsNotification['type']) {
  if (type === 'ADMIN_REVIEW_REQUIRED') {
    return 'bg-purple-100 text-purple-700'
  }
  if (type === 'HOT_ARTICLE' || type === 'AUTHOR_ARTICLE_HOT') {
    return 'bg-orange-100 text-orange-700'
  }
  if (type === 'ARTICLE_REJECTED') {
    return 'bg-red-100 text-red-700'
  }
  if (type === 'ARTICLE_APPROVED') {
    return 'bg-emerald-100 text-emerald-700'
  }
  return 'bg-blue-100 text-blue-700'
}
</script>

<style scoped>
.notification-panel-enter-active,
.notification-panel-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}
.notification-panel-enter-from,
.notification-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(.98);
}
</style>
