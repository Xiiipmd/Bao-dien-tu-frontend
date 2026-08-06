<template>
  <div class="min-h-[calc(100vh-64px)] bg-slate-900 py-16 px-4">
    <div class="container mx-auto max-w-5xl">
      <div class="mb-16 text-center">
        <Crown class="mx-auto mb-4 h-16 w-16 text-amber-500" />
        <h1 class="mb-4 text-3xl font-bold text-white md:text-5xl">Nâng cấp VIP</h1>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto">
          Mở khóa toàn bộ kho tàng tri thức, đọc bài không giới hạn và tận hưởng trải nghiệm không quảng cáo.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loadingPackages" class="mb-16 flex justify-center items-center gap-3 text-slate-300">
        <Loader2 class="h-6 w-6 animate-spin" /> Đang tải gói VIP...
      </div>

      <!-- Package Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          @click="selectedPackage = pkg.id"
          :class="[
            'relative cursor-pointer rounded-2xl border-2 p-8 transition-all duration-300',
            selectedPackage === pkg.id
              ? 'border-amber-500 bg-slate-800 scale-105 shadow-2xl shadow-amber-500/20'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
          ]"
        >
          <div v-if="pkg.id === mostPopularId" class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
            Phổ biến nhất
          </div>

          <h3 class="mb-2 text-2xl font-bold text-white">{{ pkg.name }}</h3>
          <div class="mb-6 flex items-baseline gap-2 border-b border-slate-700 pb-6">
            <span class="text-4xl font-black text-amber-500">{{ formatPrice(pkg.price) }}</span>
            <span class="text-slate-400">/ {{ pkg.durationDays }} ngày</span>
          </div>

          <ul class="space-y-3">
            <li class="flex items-start gap-3 text-slate-300">
              <CheckCircle2 class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <span>Đọc không giới hạn bài viết VIP</span>
            </li>
            <li class="flex items-start gap-3 text-slate-300">
              <CheckCircle2 class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <span>Không quảng cáo</span>
            </li>
            <li class="flex items-start gap-3 text-slate-300">
              <CheckCircle2 class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <span>Tải PDF lưu trữ</span>
            </li>
            <li v-if="pkg.durationDays >= 365" class="flex items-start gap-3 text-slate-300">
              <CheckCircle2 class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
              <span>Huy hiệu thành viên VIP</span>
            </li>
            <li v-if="pkg.description" class="flex items-start gap-3 text-slate-400 text-sm italic">
              <span>{{ normalizeVipDescription(pkg.description, pkg.durationDays) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Payment Section -->
      <div v-if="packages.length > 0" class="max-w-2xl mx-auto rounded-2xl bg-white p-8 shadow-xl">
        <h3 class="mb-6 text-xl font-bold text-gray-900">Phương thức thanh toán</h3>

        <div class="grid grid-cols-3 gap-4 mb-8">
          <button
            v-for="method in paymentMethods"
            :key="method.id"
            @click="paymentMethod = method.id"
            :class="['flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 transition-colors', paymentMethod === method.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50']"
          >
            <component :is="method.icon" class="h-8 w-8" />
            <span class="text-sm font-semibold">{{ method.label }}</span>
          </button>
        </div>

        <button
          @click="handlePayment"
          :disabled="paymentLoading || !selectedPackage"
          class="w-full rounded-xl bg-amber-500 py-4 text-lg font-bold text-white transition-colors hover:bg-amber-600 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Loader2 v-if="paymentLoading" class="h-5 w-5 animate-spin" />
          {{ paymentLoading ? 'Đang xử lý...' : `Thanh toán ${selectedPkg ? formatPrice(selectedPkg.price) : ''}` }}
        </button>
        <p class="mt-4 text-center text-sm text-gray-500">
          Thanh toán an toàn và bảo mật 100%. Có thể hủy bất kỳ lúc nào.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Crown, CheckCircle2, CreditCard, QrCode, Wallet, Loader2 } from 'lucide-vue-next'
import api from '@/api'
import { normalizeVipDescription } from '@/utils/vipText'

interface VipPackage {
  id: number
  name: string
  durationDays: number
  price: number
  description: string
}

const packages = ref<VipPackage[]>([])
const loadingPackages = ref(true)
const selectedPackage = ref<number | null>(null)
const paymentMethod = ref('qr')
const paymentLoading = ref(false)

const selectedPkg = computed(() => packages.value.find(p => p.id === selectedPackage.value))
const mostPopularId = computed(() =>
  packages.value.length > 0
    ? packages.value.reduce((a, b) => (a.durationDays >= b.durationDays ? a : b)).id
    : null
)

const paymentMethods = [
  { id: 'qr', label: 'Chuyển khoản QR', icon: QrCode },
  { id: 'wallet', label: 'Ví điện tử', icon: Wallet },
  { id: 'card', label: 'Thẻ tín dụng', icon: CreditCard },
]

function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ'
}

onMounted(async () => {
  try {
    const res = await api.get('/api/vip-packages')
    packages.value = res.data
    if (packages.value.length > 0) {
      selectedPackage.value = mostPopularId.value
    }
  } catch {
    // fallback: leave empty
  } finally {
    loadingPackages.value = false
  }
})

async function handlePayment() {
  if (!selectedPackage.value) return
  paymentLoading.value = true
  try {
    const res = await api.post('/api/transactions/create', {
      packageId: selectedPackage.value,
    })
    if (res.data?.paymentUrl) {
      window.location.href = res.data.paymentUrl
    }
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? 'Vui lòng đăng nhập để thực hiện thanh toán.'
    alert(msg)
  } finally {
    paymentLoading.value = false
  }
}
</script>
