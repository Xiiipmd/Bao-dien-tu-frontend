<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Quản lý gói VIP</h2>
      <button @click="openCreate" class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
        <Plus class="h-4 w-4" /> Thêm gói VIP
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20 text-gray-500">Đang tải...</div>
    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{{ error }}</div>
    <div v-else class="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm text-gray-600">
        <thead class="bg-gray-50 text-gray-700">
          <tr>
            <th class="px-6 py-4 font-semibold">Tên gói</th>
            <th class="px-6 py-4 font-semibold">Thời hạn (ngày)</th>
            <th class="px-6 py-4 font-semibold">Giá (VNĐ)</th>
            <th class="px-6 py-4 font-semibold">Giảm giá (%)</th>
            <th class="px-6 py-4 font-semibold">Mô tả</th>
            <th class="px-6 py-4 font-semibold text-right">Hành động</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="pkg in packages" :key="pkg.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ pkg.name }}</td>
            <td class="px-6 py-4">{{ pkg.durationDays }}</td>
            <td class="px-6 py-4 font-semibold text-amber-600">{{ pkg.price.toLocaleString() }}</td>
            <td class="px-6 py-4">{{ pkg.discountPercent ?? 0 }}%</td>
            <td class="px-6 py-4 text-gray-500 max-w-xs truncate">{{ pkg.description }}</td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEdit(pkg)" class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  <Pencil class="h-3 w-3" /> Sửa
                </button>
                <button @click="confirmDelete(pkg)" class="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 class="h-3 w-3" /> Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Create / Edit Modal -->
  <div v-if="formModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="formModal = false">
    <div class="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
      <h3 class="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
        <component :is="isEditing ? Pencil : Plus" class="h-5 w-5 text-blue-600" />
        {{ isEditing ? 'Chỉnh sửa gói VIP' : 'Thêm gói VIP mới' }}
      </h3>
      <form @submit.prevent="handleSave" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Tên gói <span class="text-red-500">*</span></label>
          <input v-model="formData.name" type="text" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Thời hạn (ngày) <span class="text-red-500">*</span></label>
            <input v-model.number="formData.durationDays" type="number" min="1" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Giá (VNĐ) <span class="text-red-500">*</span></label>
            <input v-model.number="formData.price" type="number" min="0" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Giảm giá (%) <span class="text-red-500">*</span></label>
          <input v-model.number="formData.discountPercent" type="number" min="0" max="100" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
          <textarea v-model="formData.description" rows="3" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none resize-none"></textarea>
        </div>
        <div class="flex gap-3 justify-end pt-2">
          <button type="button" @click="formModal = false" class="rounded-lg border border-gray-300 bg-white px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50">Hủy</button>
          <button type="submit" :disabled="saving" class="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            <Save class="h-4 w-4" />
            {{ saving ? 'Đang lưu...' : (isEditing ? 'Lưu thay đổi' : 'Tạo gói') }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="deleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="deleteModal = false">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
      <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <Trash2 class="h-7 w-7 text-red-600" />
      </div>
      <h3 class="mb-2 text-lg font-bold text-gray-900">Xóa gói VIP?</h3>
      <p class="mb-6 text-sm text-gray-500">
        Bạn chắc chắn muốn xóa gói <strong class="text-gray-800">{{ deleteTarget?.name }}</strong>?
        Hành động này không thể hoàn tác. Gói có giao dịch liên kết sẽ không thể xóa.
      </p>
      <div class="flex gap-3 justify-center">
        <button @click="deleteModal = false" class="rounded-lg border border-gray-300 bg-white px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50">Hủy</button>
        <button @click="handleDelete" :disabled="deleting" class="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
          <Trash2 class="h-4 w-4" /> {{ deleting ? 'Đang xóa...' : 'Xóa' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Pencil, Save, Plus, Trash2 } from 'lucide-vue-next'
import api from '@/api'

interface VipPackage {
  id: number
  name: string
  durationDays: number
  price: number
  discountPercent: number
  description: string
}

const packages = ref<VipPackage[]>([])
const loading = ref(true)
const error = ref('')

// Form modal (create & edit)
const formModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const formData = reactive({ name: '', durationDays: 30, price: 0, discountPercent: 0, description: '' })

// Delete modal
const deleteModal = ref(false)
const deleteTarget = ref<VipPackage | null>(null)
const deleting = ref(false)

onMounted(async () => {
  try {
    const res = await api.get('/api/admin/vip-packages')
    packages.value = res.data
  } catch {
    error.value = 'Không thể tải dữ liệu. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
})

function openCreate() {
  isEditing.value = false
  editingId.value = null
  Object.assign(formData, { name: '', durationDays: 30, price: 0, discountPercent: 0, description: '' })
  formModal.value = true
}

function openEdit(pkg: VipPackage) {
  isEditing.value = true
  editingId.value = pkg.id
  Object.assign(formData, { ...pkg })
  formModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (isEditing.value && editingId.value !== null) {
      const res = await api.put(`/api/admin/vip-packages/${editingId.value}`, formData)
      const idx = packages.value.findIndex(p => p.id === editingId.value)
      if (idx !== -1) packages.value[idx] = res.data
    } else {
      const res = await api.post('/api/admin/vip-packages', formData)
      packages.value.push(res.data)
    }
    formModal.value = false
  } catch {
    alert('Lưu thất bại. Vui lòng thử lại.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(pkg: VipPackage) {
  deleteTarget.value = pkg
  deleteModal.value = true
}

async function handleDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await api.delete(`/api/admin/vip-packages/${deleteTarget.value.id}`)
    packages.value = packages.value.filter(p => p.id !== deleteTarget.value!.id)
    deleteModal.value = false
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? 'Xóa thất bại. Gói có thể đang có giao dịch liên kết.'
    alert(msg)
  } finally {
    deleting.value = false
  }
}
</script>
