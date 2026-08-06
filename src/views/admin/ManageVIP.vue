<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Quản lý gói VIP</h2>
      <div class="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">Backend hiện hỗ trợ xem và cập nhật gói VIP.</div>
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
            <td class="px-6 py-4 font-semibold text-amber-600">{{ pkg.price.toLocaleString('vi-VN') }}</td>
            <td class="px-6 py-4">{{ pkg.discountPercent ?? 0 }}%</td>
            <td class="px-6 py-4 text-gray-500 max-w-xs truncate">{{ normalizeVipDescription(pkg.description, pkg.durationDays) }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="openEdit(pkg)" class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <Pencil class="h-3 w-3" /> Sửa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="formModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="formModal = false">
    <div class="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
      <h3 class="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
        <Pencil class="h-5 w-5 text-blue-600" />
        Chỉnh sửa gói VIP
      </h3>
      <form @submit.prevent="handleSave" class="space-y-5">
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-700">Tên gói <span class="text-red-500">*</span></label>
          <input v-model="formData.name" type="text" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm font-semibold text-gray-700">Thời hạn (ngày) <span class="text-red-500">*</span></label>
            <input v-model.number="formData.durationDays" type="number" min="1" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-semibold text-gray-700">Giá (VNĐ) <span class="text-red-500">*</span></label>
            <input v-model.number="formData.price" type="number" min="1" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-700">Giảm giá (%) <span class="text-red-500">*</span></label>
          <input v-model.number="formData.discountPercent" type="number" min="0" max="100" required class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-semibold text-gray-700">Mô tả</label>
          <textarea v-model="formData.description" rows="3" class="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none resize-none"></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="formModal = false" class="rounded-lg border border-gray-300 bg-white px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50">Hủy</button>
          <button type="submit" :disabled="saving" class="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            <Save class="h-4 w-4" />
            {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Pencil, Save } from 'lucide-vue-next'
import { fetchAdminVipPackages, updateAdminVipPackage, type AdminVipPackage } from '@/api/staff'
import { normalizeVipDescription } from '@/utils/vipText'

const packages = ref<AdminVipPackage[]>([])
const loading = ref(true)
const error = ref('')
const formModal = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const formData = reactive({ name: '', durationDays: 30, price: 0, discountPercent: 0, description: '' })

onMounted(async () => {
  try {
    packages.value = await fetchAdminVipPackages()
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? 'Không thể tải dữ liệu. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
})

function openEdit(pkg: AdminVipPackage) {
  editingId.value = pkg.id
  Object.assign(formData, {
    ...pkg,
    description: normalizeVipDescription(pkg.description, pkg.durationDays),
  })
  formModal.value = true
}

async function handleSave() {
  if (editingId.value === null) {
    return
  }

  saving.value = true
  try {
    const updatedPackage = await updateAdminVipPackage(editingId.value, formData)
    const packageIndex = packages.value.findIndex(pkg => pkg.id === editingId.value)
    if (packageIndex !== -1) {
      packages.value[packageIndex] = updatedPackage
    }
    formModal.value = false
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Lưu thất bại. Vui lòng thử lại.')
  } finally {
    saving.value = false
  }
}
</script>
