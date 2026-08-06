<template>
  <div class="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
    <div v-if="loading" class="flex min-h-[60vh] items-center justify-center text-gray-500">Đang tải chi tiết bài viết...</div>
    <div v-else-if="pageError" class="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">{{ pageError }}</div>
    <template v-else-if="article">
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <!-- Main Content -->
      <div class="lg:col-span-10 lg:col-start-2">
        <header class="mb-8">
          <div class="mb-4 flex items-center gap-2">
            <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 uppercase tracking-wider">
              {{ article.categoryName }}
            </span>
            <span v-if="article.isVip" class="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              <Crown class="h-3 w-3" /> VIP
            </span>
          </div>

          <h1 class="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">{{ article.title }}</h1>

          <div class="flex flex-wrap items-center gap-6 border-y border-gray-100 py-4 text-sm text-gray-600">
            <RouterLink :to="`/author/${article.authorId}`" class="flex items-center gap-2 group" v-if="article.authorId !== undefined && article.authorId !== null">
              <img :src="authorAvatar" :alt="article.authorName" class="h-6 w-6 rounded-full object-cover bg-gray-100" />
              <span class="font-medium group-hover:text-blue-600 transition-colors">{{ article.authorName }}</span>
            </RouterLink>
            <span v-else class="flex items-center gap-2 text-gray-400">
              <img :src="authorAvatar" :alt="article.authorName" class="h-6 w-6 rounded-full object-cover bg-gray-100" />
              <span class="font-medium">{{ article.authorName }}</span>
            </span>
            <div class="flex items-center gap-2">
              <Calendar class="h-4 w-4" />
              <span>{{ article.date }}</span>
            </div>
            <div class="ml-auto flex items-center gap-3">
              <button
                v-if="showStatsToggle"
                :disabled="statsLoading"
                @click="toggleStats"
                class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                <BarChart3 class="h-4 w-4 text-blue-500" />
                {{ statsOpen ? 'Ẩn thống kê' : 'Thống kê bài báo' }}
              </button>
              <button
                :disabled="summaryLoading"
                @click="toggleSummary"
                class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                <Sparkles class="h-4 w-4 text-purple-500" />
                {{ summaryLoading ? 'Đang tải...' : (isSummaryOpen ? 'Thu gọn tóm tắt' : 'Tóm tắt AI') }}
              </button>
              <button @click="handleDownloadPdf" class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download class="h-4 w-4" /> Tải PDF
              </button>
            </div>
          </div>
        </header>

        <ArticleReader
          class="mb-4"
          :title="article.title"
          :sapo="article.sapo"
          :html="articleHtml"
        />

        <div class="article-tools mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div class="flex items-center gap-2" aria-label="Điều chỉnh cỡ chữ bài viết">
            <span class="mr-1 text-sm font-semibold text-gray-700">Cỡ chữ</span>
            <button
              type="button"
              class="tool-button"
              :disabled="articleFontSize <= 16"
              title="Giảm cỡ chữ"
              aria-label="Giảm cỡ chữ"
              @click="changeFontSize(-2)"
            >
              <Minus class="h-4 w-4" /> <span class="text-xs font-bold">A</span>
            </button>
            <span class="min-w-10 text-center text-sm font-semibold text-gray-600">{{ articleFontSize }}px</span>
            <button
              type="button"
              class="tool-button"
              :disabled="articleFontSize >= 24"
              title="Tăng cỡ chữ"
              aria-label="Tăng cỡ chữ"
              @click="changeFontSize(2)"
            >
              <Plus class="h-4 w-4" /> <span class="font-bold">A</span>
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-2" aria-label="Chia sẻ bài viết">
            <span class="mr-1 hidden text-sm font-semibold text-gray-700 sm:inline">Chia sẻ</span>
            <button type="button" class="share-button bg-[#1877f2] text-white" title="Chia sẻ lên Facebook" @click="shareTo('facebook')">FB</button>
            <button type="button" class="share-button bg-[#0068ff] text-white" title="Chia sẻ qua Zalo" @click="shareTo('zalo')">Zalo</button>
            <button type="button" class="share-button bg-gray-900 text-white" title="Chia sẻ lên X (Twitter)" @click="shareTo('twitter')">X</button>
            <button type="button" class="tool-button px-3" title="Sao chép liên kết" @click="copyArticleLink">
              <Check v-if="linkCopied" class="h-4 w-4 text-green-600" />
              <Copy v-else class="h-4 w-4" />
              <span>{{ linkCopied ? 'Đã sao chép' : 'Copy link' }}</span>
            </button>
          </div>
        </div>

        <div class="mb-8">
          <div v-if="nonVipNotice" class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {{ nonVipNotice }}
          </div>
          <div v-if="isSummaryOpen" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Sparkles class="h-4 w-4 text-purple-500" /> Tóm tắt AI
            </div>
            <div v-if="summaryLoading" class="text-sm text-gray-500">Đang tạo tóm tắt...</div>
            <div v-else-if="summaryError" class="text-sm text-red-600">{{ summaryError }}</div>
            <p v-else class="text-sm leading-6 text-gray-700 whitespace-pre-line">{{ summaryContent }}</p>
          </div>
        </div>

        <section v-if="statsOpen" class="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Thống kê bài viết</h3>
              <p class="mt-1 text-sm text-gray-500">Chọn khoảng thời gian và đơn vị hiển thị trước khi xem thống kê.</p>
            </div>

            <div v-if="!canViewStats" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Bạn chỉ có thể xem thống kê bài viết của chính mình.
            </div>

            <template v-else>
              <form class="grid gap-3 md:grid-cols-4" @submit.prevent="handleStatsSubmit">
                <label class="text-sm font-medium text-gray-700">
                  <span class="mb-2 block">Từ thời điểm</span>
                  <input
                    v-model="statsStartInput"
                    type="datetime-local"
                    class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label class="text-sm font-medium text-gray-700">
                  <span class="mb-2 block">Đến thời điểm</span>
                  <input
                    v-model="statsEndInput"
                    type="datetime-local"
                    class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label class="text-sm font-medium text-gray-700">
                  <span class="mb-2 block">Granularity</span>
                  <select
                    v-model="statsGranularity"
                    class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="hour">Theo giờ</option>
                    <option value="day">Theo ngày</option>
                    <option value="month">Theo tháng</option>
                  </select>
                </label>

                <div class="flex items-end">
                  <button
                    type="submit"
                    :disabled="statsLoading"
                    class="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {{ statsLoading ? 'Đang tải...' : 'Xem thống kê' }}
                  </button>
                </div>
              </form>

              <p class="text-xs text-gray-500">
                Bỏ trống để mặc định từ ngày đăng bài đến thời điểm hiện tại.
              </p>

              <div v-if="statsError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {{ statsError }}
              </div>

              <div v-if="statsWarning" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {{ statsWarning }}
              </div>

              <div v-if="statsData" class="mt-6 space-y-6">
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p class="text-sm font-medium text-gray-500">Tổng lượt xem</p>
                    <p class="mt-3 text-2xl font-bold text-gray-900">{{ formatNumber(statsData.views) }}</p>
                    <p class="mt-2 text-xs text-gray-500">Tổng lượt xem trong khoảng thời gian chọn.</p>
                  </div>
                  <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p class="text-sm font-medium text-gray-500">{{ statsRevenueTitle }}</p>
                    <p class="mt-3 text-2xl font-bold text-gray-900">{{ formatCurrency(statsData.estimatedEarning) }}</p>
                    <p class="mt-2 text-xs text-gray-500">{{ statsRevenueCaption }}</p>
                  </div>
                </div>

                <div v-if="statsNoData" class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
                  Chưa có dữ liệu.
                </div>

                <div v-else class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div class="mb-4">
                    <h4 class="text-base font-bold text-gray-900">Biểu đồ lượt xem theo {{ statsGranularityLabel }}</h4>
                    <p v-if="statsRangeLabel" class="mt-1 text-sm text-gray-500">{{ statsRangeLabel }}</p>
                  </div>
                  <div class="h-72">
                    <Bar :data="statsChartData" :options="statsBarOptions" />
                  </div>
                </div>
              </div>
            </template>
          </div>
        </section>

        <div v-if="isVideoMedia(article.image)" class="relative mb-10 aspect-video w-full overflow-hidden rounded-xl bg-black">
          <CoverMedia :src="article.image" :alt="article.title" media-class="h-full w-full object-cover" />
          <span class="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow">
            <Play class="h-3.5 w-3.5 fill-current" /> Video
          </span>
        </div>
        <button
          v-else
          type="button"
          class="group relative mb-10 block aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl bg-gray-100"
          title="Nhấn để xem ảnh lớn"
          @click="openLightbox(article.image, article.title)"
        >
          <img :src="article.image" :alt="article.title" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          <span class="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Maximize2 class="h-4 w-4" /> Xem ảnh lớn
          </span>
        </button>

        <div class="relative">
          <div
            :class="['article-content prose prose-lg max-w-none prose-p:text-gray-700 prose-headings:text-gray-900', showVipOverlay ? 'max-h-75 overflow-hidden' : '']"
            :style="{ '--article-font-size': `${articleFontSize}px` }"
            v-html="articleHtml"
            @click="handleArticleContentClick"
          />

          <!-- VIP Overlay -->
          <template v-if="showVipOverlay">
            <div class="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-white via-white/80 to-transparent backdrop-blur-[2px]" />
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md">
              <div class="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center shadow-lg">
                <Crown class="mx-auto mb-3 h-10 w-10 text-amber-500" />
                <h3 class="mb-2 text-xl font-bold text-gray-900">Nội dung dành riêng cho VIP</h3>
                <p class="mb-6 text-sm text-gray-600">Nâng cấp tài khoản để đọc trọn vẹn bài viết này và hàng ngàn bài viết chất lượng cao khác.</p>
                <RouterLink to="/vip" class="inline-block w-full rounded-lg bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600">
                  Đăng ký VIP ngay
                </RouterLink>
              </div>
            </div>
          </template>
        </div>

        <section v-if="relatedArticles.length" class="mt-12 border-t border-gray-200 pt-8">
          <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Bài viết liên quan</h3>
              <p class="mt-1 text-sm text-gray-500">Các bài viết cùng chuyên mục {{ article.categoryName }}</p>
            </div>
          </div>

          <div class="grid gap-5 md:grid-cols-2">
            <RouterLink
              v-for="related in relatedArticles"
              :key="related.id"
              :to="`/article/${related.id}`"
              class="group flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-blue-100 hover:shadow-md"
            >
              <div class="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <CoverMedia :src="related.image" :alt="related.title" media-class="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div class="flex min-w-0 flex-1 flex-col justify-center">
                <span class="mb-2 text-xs font-semibold uppercase text-blue-600">{{ related.category }}</span>
                <h4 class="mb-2 text-base font-bold leading-tight text-gray-900 group-hover:text-blue-600 line-clamp-2">{{ related.title }}</h4>
                <span class="text-xs text-gray-500">{{ related.date }}</span>
              </div>
            </RouterLink>
          </div>
        </section>

        <!-- Comment Section -->
        <section class="mt-16 pt-8 border-t border-gray-200">
          <h3 class="mb-8 text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare class="h-6 w-6 text-blue-600" />
            Bình luận ({{ comments.length }})
          </h3>

          <form @submit.prevent="handleCommentSubmit" class="mb-10">
            <div class="mb-3">
              <textarea
                v-model="commentText"
                rows="3"
                placeholder="Chia sẻ ý kiến của bạn..."
                class="w-full rounded-xl border border-gray-300 p-4 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              ></textarea>
              <p v-if="commentError" class="mt-2 text-sm text-red-600">{{ commentError }}</p>
            </div>
            <div class="flex justify-end">
              <button :disabled="commentSubmitting" type="submit" class="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
                <Send class="h-4 w-4" /> Gửi bình luận
              </button>
            </div>
          </form>

          <div class="space-y-6">
            <div v-for="comment in comments" :key="comment.id" class="flex gap-4">
              <img :src="comment.avatar" :alt="comment.user" class="h-12 w-12 rounded-full object-cover bg-gray-100" />
              <div class="flex-1">
                <div class="rounded-2xl rounded-tl-none bg-gray-50 p-4 border border-gray-100">
                  <div class="mb-1 flex items-center justify-between">
                    <h4 class="font-bold text-gray-900">{{ comment.user }}</h4>
                    <span class="text-xs text-gray-500">{{ comment.time }}</span>
                  </div>
                  <p class="text-gray-700">{{ comment.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    </template>

    <Teleport to="body">
      <div
        v-if="lightboxImage"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="lightboxAlt || 'Xem ảnh lớn'"
        @click.self="closeLightbox"
      >
        <img :src="lightboxImage" :alt="lightboxAlt" class="max-h-[92vh] max-w-[96vw] object-contain" />
        <button type="button" class="absolute right-4 top-4 rounded-full bg-white/15 p-3 text-white transition hover:bg-white/25" aria-label="Đóng ảnh lớn" @click="closeLightbox">
          <X class="h-6 w-6" />
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, Crown, Download, Sparkles, MessageSquare, Send, BarChart3, Minus, Plus, Copy, Check, Maximize2, X, Play } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'
import CoverMedia from '@/components/CoverMedia.vue'
import ArticleReader from '@/components/ArticleReader.vue'
import { isVideoMedia } from '@/utils/media'
import { fetchArticleStats, type ArticleStatDto } from '@/api/stats'
import {
  createArticleComment,
  downloadArticlePdf,
  fetchArticleComments,
  fetchArticlePreview,
  fetchArticleRead,
  fetchPublicArticles,
  toArticleCardViewModel,
  toArticleCommentViewModel,
  toArticleDetailViewModel,
  type ArticleCardViewModel,
  type ArticleCommentViewModel,
  type ArticleDetailViewModel,
  type ArticleSearchResponse,
} from '@/api/articles'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const id = computed(() => route.params.id as string)
const articleIdNumber = computed(() => Number(id.value))
const canFetchSummary = computed(() => Number.isFinite(articleIdNumber.value) && articleIdNumber.value > 0)
const article = ref<ArticleDetailViewModel | null>(null)
const articleHtml = ref('')
const articleFontSize = ref(Number(localStorage.getItem('article-font-size')) || 18)
const linkCopied = ref(false)
const lightboxImage = ref('')
const lightboxAlt = ref('')
const relatedArticles = ref<ArticleCardViewModel[]>([])
const comments = ref<ArticleCommentViewModel[]>([])
const loading = ref(true)
const pageError = ref('')
const previewMode = ref(false)
const authorAvatar = computed(() => {
  const name = article.value?.authorName ?? 'Tác giả'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e5e7eb&color=111827`
})
const showVipOverlay = computed(() => previewMode.value)

function changeFontSize(delta: number) {
  articleFontSize.value = Math.min(24, Math.max(16, articleFontSize.value + delta))
  localStorage.setItem('article-font-size', String(articleFontSize.value))
}

function shareTo(platform: 'facebook' | 'zalo' | 'twitter') {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(article.value?.title ?? '')
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    zalo: `https://zalo.me/share?url=${url}`,
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
  }
  window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=720,height=560')
}

async function copyArticleLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
  } catch {
    const input = document.createElement('input')
    input.value = window.location.href
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
  linkCopied.value = true
  window.setTimeout(() => { linkCopied.value = false }, 1800)
}

function openLightbox(src: string, alt = '') {
  if (!src) return
  lightboxImage.value = src
  lightboxAlt.value = alt
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxImage.value = ''
  document.body.style.overflow = ''
}

function handleArticleContentClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target instanceof HTMLImageElement) {
    openLightbox(target.currentSrc || target.src, target.alt)
  }
}

function prepareArticleHtml(content: string) {
  const documentFragment = new DOMParser().parseFromString(content, 'text/html')
  documentFragment.querySelectorAll('video').forEach(video => {
    video.controls = true
    video.playsInline = true
    video.preload = 'metadata'
  })
  documentFragment.querySelectorAll('img').forEach(image => {
    image.loading = 'lazy'
    image.title ||= 'Nhấn để xem ảnh lớn'
  })
  return documentFragment.body.innerHTML
}

const commentText = ref('')
const commentError = ref('')
const commentSubmitting = ref(false)

const isSummaryOpen = ref(false)
const summaryContent = ref('')
const summaryError = ref('')
const summaryLoading = ref(false)
const nonVipNotice = ref('')

const statsOpen = ref(false)
const statsLoading = ref(false)
const statsError = ref('')
const statsWarning = ref('')
const statsData = ref<ArticleStatDto | null>(null)
const statsStartInput = ref('')
const statsEndInput = ref('')
const statsGranularity = ref<'hour' | 'day' | 'month'>('day')
const statsRange = ref<{ start: string; end: string } | null>(null)
const articlePublishedAt = ref('')

const showStatsToggle = computed(() => auth.isAdmin || auth.isAuthor)
const canViewStats = computed(() => {
  if (auth.isAdmin) return true
  if (!auth.isAuthor) return false
  if (!article.value || !auth.userId) return false
  return article.value.authorId === auth.userId
})

const statsSeries = computed(() => statsData.value?.viewsByLevelOfGranularity ?? [])
const statsNoData = computed(() => {
  if (!statsData.value) return false
  if (statsData.value.views === 0 && statsSeries.value.length === 0) return true
  return statsData.value.views === 0 && statsSeries.value.every(value => value === 0)
})

const statsGranularityLabel = computed(() => {
  switch (statsGranularity.value) {
    case 'hour':
      return 'giờ'
    case 'month':
      return 'tháng'
    default:
      return 'ngày'
  }
})

const statsRangeLabel = computed(() => {
  if (!statsRange.value) return ''
  return `${formatDisplayDateTime(statsRange.value.start)} - ${formatDisplayDateTime(statsRange.value.end)}`
})

const statsRevenueTitle = computed(() => (auth.isAdmin ? 'Tổng doanh thu tác giả nhận' : 'Doanh thu tác giả nhận'))
const statsRevenueCaption = computed(() => {
  if (!article.value?.isVip) {
    return 'Chỉ áp dụng cho bài viết VIP.'
  }
  return auth.isAdmin ? 'Ước tính doanh thu theo dữ liệu backend.' : 'Ước tính theo dữ liệu backend.'
})

const statsChartData = computed(() => ({
  labels: statsSeries.value.map((_, index) => String(index + 1)),
  datasets: [{
    label: 'Lượt xem',
    data: statsSeries.value,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  }],
}))

const statsBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#E5E7EB' } },
  },
}

watch(id, async () => {
  isSummaryOpen.value = false
  summaryContent.value = ''
  summaryError.value = ''
  summaryLoading.value = false
  nonVipNotice.value = ''
  statsOpen.value = false
  statsLoading.value = false
  statsError.value = ''
  statsWarning.value = ''
  statsData.value = null
  statsStartInput.value = ''
  statsEndInput.value = ''
  statsGranularity.value = 'day'
  statsRange.value = null
  await loadArticle()
}, { immediate: true })

async function toggleSummary() {
  if (!auth.isVip) {
    nonVipNotice.value = 'Bạn phải đăng ký gói VIP để sử dụng chức năng này'
    isSummaryOpen.value = false
    return
  }

  nonVipNotice.value = ''
  isSummaryOpen.value = !isSummaryOpen.value
  if (isSummaryOpen.value && !summaryContent.value && !summaryLoading.value) {
    await fetchSummary()
  }
}

async function fetchSummary() {
  if (!canFetchSummary.value) {
    summaryError.value = 'Không thể tải tóm tắt cho bài viết này.'
    return
  }
  summaryLoading.value = true
  summaryError.value = ''
  try {
    const res = await api.get('/api/articles/summary', { params: { articleId: articleIdNumber.value } })
    summaryContent.value = res.data?.content ?? ''
    if (!summaryContent.value) {
      summaryError.value = 'Chưa có tóm tắt cho bài viết này.'
    }
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 403) {
      summaryError.value = 'Bạn phải đăng ký gói VIP để sử dụng chức năng này'
    } else {
      summaryError.value = err?.response?.data?.message ?? 'Không thể tải tóm tắt AI. Vui lòng thử lại.'
    }
  } finally {
    summaryLoading.value = false
  }
}

function toggleStats() {
  statsOpen.value = !statsOpen.value
  if (!statsOpen.value) {
    statsError.value = ''
    statsWarning.value = ''
  }
}

async function handleStatsSubmit() {
  if (!article.value) {
    statsError.value = 'Không xác định được bài viết để thống kê.'
    return
  }
  if (!canViewStats.value) {
    statsError.value = 'Bạn không có quyền xem thống kê bài viết này.'
    return
  }

  statsError.value = ''
  statsWarning.value = ''

  const { start, end } = resolveStatsRange()
  if (!start || !end) {
    statsError.value = 'Vui lòng chọn khoảng thời gian hợp lệ.'
    return
  }

  if (start > end) {
    statsError.value = 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.'
    return
  }

  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    statsError.value = 'Định dạng thời gian không hợp lệ.'
    return
  }

  const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  if (statsGranularity.value === 'hour' && diffDays > 365) {
    statsWarning.value = 'Khoảng thời gian lớn hơn 1 năm. Nên chuyển sang thống kê theo ngày.'
  }

  statsLoading.value = true
  try {
    statsRange.value = { start, end }
    statsData.value = await fetchArticleStats(article.value.id, start, end, statsGranularity.value)
  } catch (err: any) {
    const status = err?.response?.status
    const serverMessage = err?.response?.data?.message
    if (status === 401) {
      auth.logout()
      statsError.value = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem thống kê.'
      void router.push({ path: '/login', query: { redirect: route.fullPath } })
    } else if (status === 403) {
      statsError.value = serverMessage ?? 'Tài khoản hiện tại không có quyền xem thống kê bài viết này.'
    } else {
      statsError.value = serverMessage ?? 'Không thể tải thống kê bài viết.'
    }
    statsData.value = null
  } finally {
    statsLoading.value = false
  }
}

async function handleCommentSubmit() {
  if (!article.value) {
    return
  }
  if (commentText.value.trim().length < 5) {
    commentError.value = 'Bình luận quá ngắn, vui lòng nhập nội dung có ý nghĩa.'
    return
  }

  commentError.value = ''
  commentSubmitting.value = true
  try {
    const createdComment = await createArticleComment(article.value.id, commentText.value.trim())
    comments.value.unshift(toArticleCommentViewModel(createdComment))
    commentText.value = ''
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401) {
      commentError.value = 'Vui lòng đăng nhập để bình luận.'
    } else if (status === 403) {
      commentError.value = err?.response?.data?.message ?? 'Chỉ thành viên VIP mới được bình luận.'
    } else {
      commentError.value = err?.response?.data?.message ?? 'Không thể gửi bình luận. Vui lòng thử lại.'
    }
  } finally {
    commentSubmitting.value = false
  }
}

async function handleDownloadPdf() {
  if (!article.value) {
    return
  }

  try {
    const blob = await downloadArticlePdf(article.value.id)
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `article-${article.value.id}.pdf`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.URL.revokeObjectURL(url)
  } catch (err: any) {
    nonVipNotice.value = err?.response?.data?.message ?? 'Chỉ thành viên VIP mới được tải PDF bài viết.'
  }
}

async function loadArticle() {
  if (!canFetchSummary.value) {
    pageError.value = 'Mã bài viết không hợp lệ.'
    article.value = null
    return
  }

  loading.value = true
  pageError.value = ''
  commentError.value = ''

  try {
    const [allArticles, commentList] = await Promise.all([
      fetchPublicArticles(),
      fetchArticleComments(articleIdNumber.value),
    ])
    const articleSummary = allArticles.find(candidate => candidate.id === articleIdNumber.value)

    relatedArticles.value = []
    comments.value = commentList.map(toArticleCommentViewModel)

    try {
      if (!auth.isLoggedIn && articleSummary?.type === 'VIP') {
        throw {
          response: {
            status: 403,
            data: {
              message: 'Vui lòng đăng nhập để sử dụng lượt đọc miễn phí hoặc đăng ký VIP để đọc toàn bộ bài viết này.',
            },
          },
        }
      }

      const readArticle = await fetchArticleRead(articleIdNumber.value)
      article.value = toArticleDetailViewModel(readArticle)
      articlePublishedAt.value = readArticle.createdAt ?? ''
      articleHtml.value = prepareArticleHtml(readArticle.content)
      relatedArticles.value = buildRelatedArticles(allArticles, article.value.categoryName, article.value.id)
      previewMode.value = false
      nonVipNotice.value = readArticle.accessMessage ?? ''
    } catch (err: any) {
      if (err?.response?.status !== 403) {
        throw err
      }

      const previewArticle = await fetchArticlePreview(articleIdNumber.value)
      article.value = {
        id: previewArticle.id,
        title: previewArticle.title,
        sapo: previewArticle.sapo,
        content: previewArticle.previewContent,
        image: previewArticle.coverImage,
        authorId: previewArticle.authorId,
        authorName: previewArticle.authorName,
        categoryName: previewArticle.categoryName,
        isVip: previewArticle.type === 'VIP',
        date: '',
        createdAt: '',
        viewCount: 0,
        vipAccessGranted: false,
        meteredAccessApplied: false,
        remainingFreeReads: null,
        accessMessage: err?.response?.data?.message ?? 'Bài viết này yêu cầu quyền đọc VIP.',
      }
      articlePublishedAt.value = ''
      articleHtml.value = renderPreviewHtml(previewArticle.previewContent)
      relatedArticles.value = buildRelatedArticles(allArticles, article.value.categoryName, article.value.id)
      previewMode.value = true
      nonVipNotice.value = err?.response?.data?.message ?? 'Bạn cần VIP để đọc tiếp nội dung đầy đủ.'
    }
  } catch (err: any) {
    pageError.value = err?.response?.data?.message ?? 'Không thể tải chi tiết bài viết. Vui lòng thử lại.'
    article.value = null
    articlePublishedAt.value = ''
    relatedArticles.value = []
    comments.value = []
  } finally {
    loading.value = false
  }
}

function buildRelatedArticles(
  allArticles: ArticleSearchResponse[],
  categoryName: string,
  currentArticleId: number,
) {
  const normalizedCategory = normalizeCategoryName(categoryName)
  if (!normalizedCategory) {
    return []
  }

  return allArticles
    .filter(candidate => candidate.id !== currentArticleId)
    .filter(candidate => normalizeCategoryName(candidate.categoryName) === normalizedCategory)
    .slice(0, 4)
    .map(toArticleCardViewModel)
}

function normalizeCategoryName(value?: string | null) {
  return (value ?? '').trim().toLocaleLowerCase('vi-VN')
}

function resolveStatsRange() {
  const fallbackStart = statsStartInput.value || toInputDateTime(articlePublishedAt.value || new Date())
  const fallbackEnd = statsEndInput.value || toInputDateTime(new Date())
  const start = toBackendDateTime(fallbackStart)
  const end = toBackendDateTime(fallbackEnd)
  return { start, end }
}

function toInputDateTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

function toBackendDateTime(value: string) {
  if (!value) return ''

  let normalized = value
  if (value.length === 16) {
    normalized = `${value}:00`
  } else if (value.length === 10) {
    normalized = `${value}T00:00:00`
  }

  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString()
}

function formatDisplayDateTime(value: string) {
  if (!value) return ''
  const [datePart, timePart] = value.split('T')
  if (datePart && timePart) {
    const [year, month, day] = datePart.split('-')
    const [hour, minute] = timePart.split(':')
    if (year && month && day && hour && minute) {
      return `${day}/${month}/${year} ${hour}:${minute}`
    }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatNumber(value: number) {
  return value.toLocaleString('vi-VN')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function renderPreviewHtml(content: string) {
  return content
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map(paragraph => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('')
}

function escapeHtml(content: string) {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

</script>

<style scoped>
.tool-button {
  display: inline-flex;
  min-height: 2.25rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  padding: 0.45rem 0.65rem;
  color: #374151;
  transition: background-color 0.2s, border-color 0.2s;
}
.tool-button:hover:not(:disabled) { border-color: #93c5fd; background: #eff6ff; }
.tool-button:disabled { cursor: not-allowed; opacity: 0.4; }
.share-button {
  min-height: 2.25rem;
  min-width: 2.25rem;
  border-radius: 0.5rem;
  padding: 0.45rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
  transition: filter 0.2s, transform 0.2s;
}
.share-button:hover { filter: brightness(1.1); transform: translateY(-1px); }
.article-content { font-size: var(--article-font-size); line-height: 1.85; }
.article-content :deep(p), .article-content :deep(li) { font-size: inherit; line-height: inherit; }
.article-content :deep(img) { max-width: 100%; height: auto; cursor: zoom-in; border-radius: 0.75rem; }
.article-content :deep(figure) { margin: 2rem auto; }
.article-content :deep(figcaption) {
  margin-top: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
  line-height: 1.5;
  text-align: center;
}
.article-content :deep(video) {
  display: block;
  width: 100%;
  max-height: 75vh;
  margin: 1.5rem auto;
  border-radius: 0.75rem;
  background: #000;
}
:global(html.dark) .tool-button { border-color: #475569; background: #1e293b; color: #e2e8f0; }
:global(html.dark) .article-content :deep(figcaption) { color: #94a3b8; }
</style>
