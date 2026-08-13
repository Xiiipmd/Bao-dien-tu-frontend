<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
            <ShieldCheck class="h-4 w-4" />
            Chỉ dành cho quản trị viên
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
          <p class="mt-1 text-sm text-gray-500">Tìm kiếm tài khoản, phân quyền và kiểm soát trạng thái hoạt động.</p>
        </div>

        <form class="flex w-full max-w-xl items-center gap-3" @submit.prevent="loadUsers">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="keyword"
              type="search"
              placeholder="Tìm theo họ tên hoặc email..."
              class="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LoaderCircle v-if="loading" class="h-4 w-4 animate-spin" />
            <Search v-else class="h-4 w-4" />
            Tìm kiếm
          </button>
          <button
            v-if="keyword"
            type="button"
            class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            @click="clearSearch"
          >
            Xóa lọc
          </button>
        </form>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="stat in stats" :key="stat.label" class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
            <p class="mt-2 text-3xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
          <div :class="stat.iconClass" class="flex h-11 w-11 items-center justify-center rounded-xl">
            <component :is="stat.icon" class="h-5 w-5" />
          </div>
        </div>
      </article>
    </section>

    <div v-if="notice" class="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
      <CircleCheck class="h-5 w-5 shrink-0" />
      {{ notice }}
    </div>

    <div v-if="error" class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <CircleAlert class="mt-0.5 h-5 w-5 shrink-0" />
      <div class="flex-1">{{ error }}</div>
      <button class="font-semibold underline" @click="loadUsers">Thử lại</button>
    </div>

    <section class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h3 class="font-bold text-gray-900">Danh sách tài khoản</h3>
          <p class="mt-0.5 text-xs text-gray-500">{{ resultDescription }}</p>
        </div>
        <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{{ users.length }} tài khoản</span>
      </div>

      <div v-if="loading" class="flex items-center justify-center gap-3 py-20 text-sm text-gray-500">
        <LoaderCircle class="h-5 w-5 animate-spin text-blue-600" />
        Đang tải danh sách người dùng...
      </div>

      <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <UserSearch class="h-7 w-7" />
        </div>
        <h4 class="font-semibold text-gray-800">Không tìm thấy tài khoản</h4>
        <p class="mt-1 text-sm text-gray-500">Hãy thử một họ tên hoặc địa chỉ email khác.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-6 py-4">Người dùng</th>
              <th class="px-6 py-4">Vai trò</th>
              <th class="px-6 py-4">Trạng thái</th>
              <th class="px-6 py-4">Ngày tham gia</th>
              <th class="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in users" :key="user.id" class="transition hover:bg-slate-50/70">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 font-bold text-blue-700">
                    {{ initials(user.fullName) }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="truncate font-semibold text-gray-900">{{ user.fullName }}</p>
                      <span v-if="isCurrentUser(user)" class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">Bạn</span>
                    </div>
                    <p class="truncate text-xs text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <select
                  :value="user.role"
                  :disabled="isCurrentUser(user) || savingUserId === user.id"
                  class="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  @change="changeRole(user, ($event.target as HTMLSelectElement).value as AdminUserRole)"
                >
                  <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
                </select>
              </td>
              <td class="px-6 py-4">
                <span :class="statusClass(user.status)" class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold">
                  <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {{ statusLabel(user.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-600">{{ formatDate(user.createdAt) }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  :disabled="isCurrentUser(user) || savingUserId === user.id"
                  :class="user.status === 'ACTIVE'
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'"
                  class="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
                  @click="toggleStatus(user)"
                >
                  <LoaderCircle v-if="savingUserId === user.id" class="h-4 w-4 animate-spin" />
                  <LockKeyhole v-else-if="user.status === 'ACTIVE'" class="h-4 w-4" />
                  <LockKeyholeOpen v-else class="h-4 w-4" />
                  {{ user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  CircleAlert,
  CircleCheck,
  Crown,
  LoaderCircle,
  LockKeyhole,
  LockKeyholeOpen,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserSearch,
} from 'lucide-vue-next'
import {
  fetchAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStatus,
} from '@/api/adminUsers'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const users = ref<AdminUser[]>([])
const keyword = ref('')
const appliedKeyword = ref('')
const loading = ref(true)
const savingUserId = ref<number | null>(null)
const error = ref('')
const notice = ref('')

const roles: Array<{ value: AdminUserRole; label: string }> = [
  { value: 'MEMBER', label: 'Thành viên' },
  { value: 'VIP', label: 'Hội viên VIP' },
  { value: 'AUTHOR', label: 'Tác giả' },
  { value: 'CENSOR', label: 'Kiểm duyệt viên' },
  { value: 'ADMIN', label: 'Quản trị viên' },
]

const stats = computed(() => [
  { label: 'Tổng tài khoản', value: users.value.length, icon: Users, iconClass: 'bg-blue-50 text-blue-600' },
  { label: 'Đang hoạt động', value: users.value.filter(user => user.status === 'ACTIVE').length, icon: UserCheck, iconClass: 'bg-emerald-50 text-emerald-600' },
  { label: 'Đang bị khóa', value: users.value.filter(user => user.status === 'LOCKED').length, icon: LockKeyhole, iconClass: 'bg-red-50 text-red-600' },
  { label: 'Quản trị viên', value: users.value.filter(user => user.role === 'ADMIN').length, icon: Crown, iconClass: 'bg-amber-50 text-amber-600' },
])

const resultDescription = computed(() => appliedKeyword.value
  ? `Kết quả phù hợp với “${appliedKeyword.value}”`
  : 'Toàn bộ tài khoản trong hệ thống')

onMounted(loadUsers)

async function loadUsers() {
  loading.value = true
  error.value = ''
  notice.value = ''
  appliedKeyword.value = keyword.value.trim()
  try {
    users.value = await fetchAdminUsers(appliedKeyword.value)
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải danh sách người dùng.'
  } finally {
    loading.value = false
  }
}

async function clearSearch() {
  keyword.value = ''
  await loadUsers()
}

async function changeRole(user: AdminUser, nextRole: AdminUserRole) {
  if (nextRole === user.role || isCurrentUser(user)) return
  const nextRoleLabel = roles.find(role => role.value === nextRole)?.label ?? nextRole
  if (!window.confirm(`Đổi vai trò của ${user.fullName} thành ${nextRoleLabel}?`)) {
    rerenderUser(user)
    return
  }

  await runUserUpdate(user, () => updateAdminUserRole(user.id, nextRole), `Đã cập nhật vai trò của ${user.fullName}.`)
}

async function toggleStatus(user: AdminUser) {
  if (isCurrentUser(user)) return
  const nextStatus: AdminUserStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE'
  const action = nextStatus === 'LOCKED' ? 'khóa' : 'mở khóa'
  if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản ${user.fullName}?`)) return

  await runUserUpdate(user, () => updateAdminUserStatus(user.id, nextStatus), `Đã ${action} tài khoản ${user.fullName}.`)
}

async function runUserUpdate(user: AdminUser, request: () => Promise<AdminUser>, successMessage: string) {
  savingUserId.value = user.id
  error.value = ''
  notice.value = ''
  try {
    replaceUser(await request())
    notice.value = successMessage
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể cập nhật tài khoản.'
    rerenderUser(user)
  } finally {
    savingUserId.value = null
  }
}

function replaceUser(updated: AdminUser) {
  const index = users.value.findIndex(user => user.id === updated.id)
  if (index !== -1) users.value[index] = updated
}

function rerenderUser(user: AdminUser) {
  users.value = users.value.map(item => item.id === user.id ? { ...item } : item)
}

function isCurrentUser(user: AdminUser) {
  return auth.userId === user.id
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return parts.slice(-2).map(part => part[0]?.toUpperCase()).join('') || 'U'
}

function statusLabel(status: AdminUserStatus) {
  return status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'
}

function statusClass(status: AdminUserStatus) {
  return status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}
</script>
