<template>
  <div class="min-h-[calc(100vh-64px)] bg-slate-950 px-4 py-12 md:py-16">
    <div class="container mx-auto max-w-6xl">
      <header class="mx-auto mb-12 max-w-3xl text-center">
        <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/25">
          <Crown class="h-7 w-7 text-amber-400" />
        </div>
        <p class="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-400">NewsDaily Membership</p>
        <h1 class="text-4xl font-black tracking-tight text-white md:text-5xl">Đọc sâu hơn, không giới hạn</h1>
        <p class="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Mở khóa toàn bộ bài VIP và những tiện ích đọc dành cho thành viên.
        </p>
      </header>

      <div v-if="loadingPackages" class="mb-14 flex items-center justify-center gap-3 text-slate-300">
        <Loader2 class="h-6 w-6 animate-spin" />
        Đang tải gói thành viên...
      </div>

      <div v-else-if="packageError" class="mx-auto mb-12 max-w-2xl rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-center text-rose-100">
        <CircleAlert class="mx-auto mb-2 h-5 w-5" />
        {{ packageError }}
        <button type="button" class="ml-2 font-bold underline underline-offset-4" @click="loadPackages">Thử lại</button>
      </div>

      <div v-else class="mx-auto mb-12 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
        <button
          v-for="pkg in packages"
          :key="pkg.id"
          type="button"
          :disabled="paymentLoading"
          :class="[
            'relative rounded-3xl border p-6 text-left transition duration-200 disabled:cursor-not-allowed disabled:opacity-70',
            selectedPackage === pkg.id
              ? 'border-amber-400 bg-slate-800 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-400/50'
              : 'border-slate-700 bg-slate-900 hover:-translate-y-1 hover:border-slate-500',
          ]"
          @click="selectPackage(pkg.id)"
        >
          <span
            v-if="pkg.id === recommendedPackageId"
            class="absolute right-5 top-5 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950"
          >
            Đề xuất
          </span>

          <div class="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10">
            <Sparkles class="h-5 w-5 text-amber-400" />
          </div>
          <p class="text-sm font-semibold text-slate-400">{{ pkg.durationDays }} ngày truy cập</p>
          <h2 class="mt-1 text-xl font-bold text-white">{{ pkg.name }}</h2>

          <div class="mt-5 border-t border-slate-700 pt-5">
            <div v-if="pkg.discountPercent > 0" class="mb-1 flex items-center gap-2">
              <span class="text-sm text-slate-500 line-through">{{ formatPrice(pkg.price) }}</span>
              <span class="rounded-full bg-rose-400/10 px-2 py-0.5 text-[10px] font-black text-rose-300">
                -{{ pkg.discountPercent }}%
              </span>
            </div>
            <p class="text-3xl font-black text-amber-400">{{ formatPrice(finalPrice(pkg)) }}</p>
          </div>

          <div class="mt-5 flex items-center gap-2 text-sm text-slate-300">
            <CheckCircle2 class="h-4 w-4 text-emerald-400" />
            Đọc không giới hạn bài VIP
          </div>
        </button>
      </div>

      <section v-if="packages.length > 0" class="mx-auto max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/30">
        <div class="border-b border-slate-200 px-6 py-6 md:px-8">
          <p class="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Thanh toán</p>
          <div class="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Chọn phương thức</h2>
              <p class="mt-1 text-sm text-slate-500">Bạn đang chọn {{ selectedPkg?.name }}.</p>
            </div>
            <p class="text-2xl font-black text-slate-900">{{ selectedPkg ? formatPrice(finalPrice(selectedPkg)) : '' }}</p>
          </div>
        </div>

        <div class="p-6 md:p-8">
          <div class="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              :disabled="paymentLoading"
              :class="[
                'flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60',
                paymentMethod === 'demo-visa'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
              ]"
              @click="choosePaymentMethod('demo-visa')"
            >
              <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-white">
                <CreditCard class="h-5 w-5" />
              </span>
              <span>
                <span class="block font-bold text-slate-900">Visa thử nghiệm</span>
                <span class="mt-0.5 block text-xs text-slate-500">Duyệt ngay để trình diễn</span>
              </span>
            </button>

            <button
              type="button"
              :disabled="paymentLoading"
              :class="[
                'flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60',
                paymentMethod === 'vnpay'
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
              ]"
              @click="choosePaymentMethod('vnpay')"
            >
              <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white">
                <QrCode class="h-5 w-5" />
              </span>
              <span>
                <span class="block font-bold text-slate-900">VNPay</span>
                <span class="mt-0.5 block text-xs text-slate-500">Cổng thanh toán thật</span>
              </span>
            </button>
          </div>

          <div v-if="paymentMethod === 'demo-visa'" class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div class="relative flex aspect-[1.58/1] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-slate-950 p-6 text-white shadow-xl shadow-blue-950/25">
                <div class="absolute -right-12 -top-20 h-52 w-52 rounded-full border border-white/10"></div>
                <div class="absolute -bottom-24 -left-12 h-52 w-52 rounded-full bg-blue-400/10"></div>
                <div class="relative flex items-center justify-between">
                  <div class="h-8 w-11 rounded-lg bg-gradient-to-br from-amber-200 to-amber-500"></div>
                  <span class="text-2xl font-black italic tracking-wide">VISA</span>
                </div>
                <p class="relative text-lg font-semibold tracking-[0.14em] sm:text-xl">
                  {{ card.number || '•••• •••• •••• ••••' }}
                </p>
                <div class="relative flex items-end justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-[9px] font-bold uppercase tracking-widest text-white/50">Chủ thẻ</p>
                    <p class="mt-1 truncate text-xs font-bold tracking-wide">{{ card.holder || DEMO_CARD.holder }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] font-bold uppercase tracking-widest text-white/50">Hết hạn</p>
                    <p class="mt-1 text-xs font-bold">{{ card.expiry || 'MM/YY' }}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                :disabled="paymentLoading"
                @click="fillDemoCard"
              >
                <CreditCard class="h-4 w-4" />
                Điền thẻ Visa mẫu
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label for="demo-card-number" class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Số thẻ</label>
                <input
                  id="demo-card-number"
                  :value="card.number"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="19"
                  :placeholder="DEMO_CARD.number"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  @input="updateCardNumber"
                />
              </div>

              <div>
                <label for="demo-card-holder" class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Tên chủ thẻ</label>
                <input
                  id="demo-card-holder"
                  v-model="card.holder"
                  autocomplete="off"
                  maxlength="40"
                  :placeholder="DEMO_CARD.holder"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  @input="clearPaymentMessage"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="demo-card-expiry" class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Hết hạn</label>
                  <input
                    id="demo-card-expiry"
                    :value="card.expiry"
                    inputmode="numeric"
                    autocomplete="off"
                    maxlength="5"
                    :placeholder="DEMO_CARD.expiry"
                    class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    @input="updateExpiry"
                  />
                </div>
                <div>
                  <label for="demo-card-cvv" class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">CVV</label>
                  <input
                    id="demo-card-cvv"
                    v-model="card.cvv"
                    type="password"
                    inputmode="numeric"
                    autocomplete="off"
                    maxlength="3"
                    :placeholder="DEMO_CARD.cvv"
                    class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    @input="sanitizeCvv"
                  />
                </div>
              </div>

              <div class="flex gap-3 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                <ShieldCheck class="mt-0.5 h-4 w-4 shrink-0" />
                <p>Không nhập thẻ thật. Số thẻ, ngày hết hạn và CVV không được gửi hoặc lưu trên backend.</p>
              </div>
            </div>
          </div>

          <div v-else class="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div class="flex items-start gap-3">
              <QrCode class="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p class="font-bold text-slate-900">Bạn sẽ được chuyển tới VNPay</p>
                <p class="mt-1 text-sm leading-6 text-slate-600">VNPay chỉ hoạt động khi backend đã cấu hình merchant, Return URL và IPN URL công khai.</p>
              </div>
            </div>
          </div>

          <div v-if="paymentError" class="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <CircleAlert class="mt-0.5 h-5 w-5 shrink-0" />
            <p>{{ paymentError }}</p>
          </div>

          <div v-if="paymentSuccess" class="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 class="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p class="font-bold">Thanh toán thử nghiệm thành công</p>
              <p class="mt-1">Quyền VIP đã được kích hoạt đến {{ formatDate(paymentSuccess) }}.</p>
            </div>
          </div>

          <button
            type="button"
            :disabled="paymentLoading || !selectedPackage || Boolean(paymentSuccess)"
            class="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-base font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            @click="handlePayment"
          >
            <Loader2 v-if="paymentLoading" class="h-5 w-5 animate-spin" />
            <CreditCard v-else-if="paymentMethod === 'demo-visa'" class="h-5 w-5" />
            <QrCode v-else class="h-5 w-5" />
            {{ paymentButtonLabel }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  CheckCircle2,
  CircleAlert,
  CreditCard,
  Crown,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-vue-next'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'

interface VipPackage {
  id: number
  name: string
  durationDays: number
  price: number
  discountPercent: number
  description: string
}

interface DemoPaymentResponse {
  transactionId: number
  paymentCode: string
  amount: number
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED'
  vipExpiryDate?: string | null
}

type PaymentMethod = 'demo-visa' | 'vnpay'

const DEMO_CARD = {
  number: '4242 4242 4242 4242',
  holder: 'NGUYEN VAN LONG',
  expiry: '12/30',
  cvv: '123',
} as const

const authStore = useAuthStore()
const packages = ref<VipPackage[]>([])
const loadingPackages = ref(true)
const packageError = ref('')
const selectedPackage = ref<number | null>(null)
const paymentMethod = ref<PaymentMethod>('demo-visa')
const paymentLoading = ref(false)
const paymentError = ref('')
const paymentSuccess = ref('')
const pendingDemoPayment = ref<DemoPaymentResponse | null>(null)
const card = reactive({ number: '', holder: '', expiry: '', cvv: '' })

const selectedPkg = computed(() => packages.value.find((pkg) => pkg.id === selectedPackage.value))
const recommendedPackageId = computed(() => {
  if (packages.value.length === 0) return null
  return packages.value.find((pkg) => pkg.durationDays === 60)?.id ?? packages.value[0].id
})
const paymentButtonLabel = computed(() => {
  if (paymentLoading.value) return 'Đang xác nhận...'
  if (paymentSuccess.value) return 'VIP đã được kích hoạt'
  const price = selectedPkg.value ? formatPrice(finalPrice(selectedPkg.value)) : ''
  return paymentMethod.value === 'demo-visa'
    ? `Xác nhận Visa thử nghiệm • ${price}`
    : `Tiếp tục với VNPay • ${price}`
})

function finalPrice(pkg: VipPackage) {
  return pkg.price * (1 - (pkg.discountPercent || 0) / 100)
}

function formatPrice(price: number) {
  return `${Math.round(price).toLocaleString('vi-VN')}đ`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(value))
}

function selectPackage(packageId: number) {
  selectedPackage.value = packageId
  resetPaymentState()
}

function choosePaymentMethod(method: PaymentMethod) {
  paymentMethod.value = method
  resetPaymentState()
}

function resetPaymentState() {
  paymentError.value = ''
  paymentSuccess.value = ''
  pendingDemoPayment.value = null
}

function clearPaymentMessage() {
  paymentError.value = ''
}

function fillDemoCard() {
  Object.assign(card, DEMO_CARD)
  clearPaymentMessage()
}

function normalizeCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16)
}

function formatCardNumber(value: string) {
  return normalizeCardNumber(value).replace(/(.{4})/g, '$1 ').trim()
}

function updateCardNumber(event: Event) {
  card.number = formatCardNumber((event.target as HTMLInputElement).value)
  clearPaymentMessage()
}

function updateExpiry(event: Event) {
  const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4)
  card.expiry = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  clearPaymentMessage()
}

function sanitizeCvv() {
  card.cvv = card.cvv.replace(/\D/g, '').slice(0, 3)
  clearPaymentMessage()
}

function validateDemoCard() {
  if (normalizeCardNumber(card.number) !== normalizeCardNumber(DEMO_CARD.number)) {
    return 'Bản demo chỉ chấp nhận số thẻ Visa mẫu hiển thị trên form.'
  }
  if (card.holder.trim().toUpperCase() !== DEMO_CARD.holder) return 'Tên chủ thẻ mẫu chưa đúng.'
  if (card.expiry !== DEMO_CARD.expiry) return 'Ngày hết hạn của thẻ mẫu chưa đúng.'
  if (card.cvv !== DEMO_CARD.cvv) return 'CVV của thẻ mẫu chưa đúng.'
  return ''
}

async function loadPackages() {
  loadingPackages.value = true
  packageError.value = ''
  try {
    const response = await api.get('/api/vip-packages')
    packages.value = (response.data ?? []).map((pkg: VipPackage) => ({
      ...pkg,
      price: Number(pkg.price),
      discountPercent: Number(pkg.discountPercent || 0),
    }))
    selectedPackage.value = recommendedPackageId.value
  } catch (error: unknown) {
    packageError.value = getApiError(error, 'Không thể tải danh sách gói VIP.')
  } finally {
    loadingPackages.value = false
  }
}

async function handlePayment() {
  if (!selectedPackage.value) return
  paymentMethod.value === 'demo-visa' ? await confirmDemoVisa() : await openVnPay()
}

async function confirmDemoVisa() {
  const validationError = validateDemoCard()
  if (validationError) {
    paymentError.value = validationError
    return
  }

  paymentLoading.value = true
  paymentError.value = ''
  try {
    let pending = pendingDemoPayment.value
    if (!pending) {
      const created = await api.post<DemoPaymentResponse>('/api/transactions/demo-card/create', {
        packageId: selectedPackage.value,
      })
      pending = created.data
      pendingDemoPayment.value = pending
    }

    const confirmed = await api.post<DemoPaymentResponse>('/api/transactions/demo-card/confirm', {
      transactionId: pending.transactionId,
      paymentCode: pending.paymentCode,
    })
    if (confirmed.data.status !== 'SUCCESS' || !confirmed.data.vipExpiryDate) {
      throw new Error('Hệ thống chưa xác nhận được quyền VIP.')
    }

    authStore.updateVipExpiryDate(confirmed.data.vipExpiryDate)
    paymentSuccess.value = confirmed.data.vipExpiryDate
    pendingDemoPayment.value = null
    card.cvv = ''
  } catch (error: unknown) {
    paymentError.value = getApiError(error, 'Không thể xác nhận giao dịch thử nghiệm.')
  } finally {
    paymentLoading.value = false
  }
}

async function openVnPay() {
  paymentLoading.value = true
  paymentError.value = ''
  try {
    const response = await api.post('/api/transactions/create', {
      packageId: selectedPackage.value,
    })
    const paymentUrl = String(response.data?.paymentUrl ?? '')
    if (!/^https?:\/\//i.test(paymentUrl)) throw new Error('Cổng thanh toán trả về URL không hợp lệ.')
    window.location.assign(paymentUrl)
  } catch (error: unknown) {
    paymentError.value = getApiError(error, 'Không thể mở cổng VNPay.')
  } finally {
    paymentLoading.value = false
  }
}

function getApiError(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const typedError = error as { message?: string; response?: { data?: { message?: string } } }
    return typedError.response?.data?.message || typedError.message || fallback
  }
  return fallback
}

onMounted(loadPackages)
</script>
