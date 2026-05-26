<template>
  <div class="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
    <div v-if="loading" class="flex min-h-[60vh] items-center justify-center text-gray-500">Đang tải chi tiết bài viết...</div>
    <div v-else-if="pageError" class="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">{{ pageError }}</div>
    <template v-else-if="article">
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <!-- Main Content -->
      <div class="lg:col-span-8">
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
            <RouterLink :to="`/author/${encodeURIComponent(article.authorName)}`" class="flex items-center gap-2 group">
              <img :src="authorAvatar" :alt="article.authorName" class="h-6 w-6 rounded-full object-cover bg-gray-100" />
              <span class="font-medium group-hover:text-blue-600 transition-colors">{{ article.authorName }}</span>
            </RouterLink>
            <div class="flex items-center gap-2">
              <Calendar class="h-4 w-4" />
              <span>{{ article.date }}</span>
            </div>
            <div class="ml-auto flex items-center gap-3">
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

        <div class="mb-10 aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
          <img :src="article.image" :alt="article.title" class="h-full w-full object-cover" />
        </div>

        <div class="relative">
          <div
            :class="['prose prose-lg max-w-none prose-p:text-gray-700 prose-headings:text-gray-900', showVipOverlay ? 'max-h-75 overflow-hidden' : '']"
            v-html="articleHtml"
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

      <!-- Sidebar -->
      <aside class="lg:col-span-4">
        <div class="sticky top-24 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 class="mb-6 text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Bài viết liên quan</h3>
          <div class="space-y-6">
            <RouterLink
              v-for="related in relatedArticles"
              :key="related.id"
              :to="`/article/${related.id}`"
              class="group flex gap-4"
            >
              <div class="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <img :src="related.image" :alt="related.title" class="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div class="flex flex-1 flex-col justify-center">
                <h4 class="mb-1 text-sm font-bold leading-tight text-gray-900 group-hover:text-blue-600 line-clamp-2">{{ related.title }}</h4>
                <span class="text-xs text-gray-500">{{ related.date }}</span>
              </div>
            </RouterLink>
          </div>
        </div>
      </aside>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, Crown, Download, Sparkles, MessageSquare, Send } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'
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
} from '@/api/articles'

const route = useRoute()
const auth = useAuthStore()

const id = computed(() => route.params.id as string)
const articleIdNumber = computed(() => Number(id.value))
const canFetchSummary = computed(() => Number.isFinite(articleIdNumber.value) && articleIdNumber.value > 0)
const article = ref<ArticleDetailViewModel | null>(null)
const articleHtml = ref('')
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

const commentText = ref('')
const commentError = ref('')
const commentSubmitting = ref(false)

const isSummaryOpen = ref(false)
const summaryContent = ref('')
const summaryError = ref('')
const summaryLoading = ref(false)
const nonVipNotice = ref('')

watch(id, async () => {
  isSummaryOpen.value = false
  summaryContent.value = ''
  summaryError.value = ''
  summaryLoading.value = false
  nonVipNotice.value = ''
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

    relatedArticles.value = allArticles
      .filter(candidate => candidate.id !== articleIdNumber.value)
      .slice(0, 4)
      .map(toArticleCardViewModel)
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
      articleHtml.value = readArticle.content
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
        authorName: previewArticle.authorName,
        categoryName: previewArticle.categoryName,
        isVip: previewArticle.type === 'VIP',
        date: '',
        viewCount: 0,
        vipAccessGranted: false,
        meteredAccessApplied: false,
        remainingFreeReads: null,
        accessMessage: err?.response?.data?.message ?? 'Bài viết này yêu cầu quyền đọc VIP.',
      }
      articleHtml.value = renderPreviewHtml(previewArticle.previewContent)
      previewMode.value = true
      nonVipNotice.value = err?.response?.data?.message ?? 'Bạn cần VIP để đọc tiếp nội dung đầy đủ.'
    }
  } catch (err: any) {
    pageError.value = err?.response?.data?.message ?? 'Không thể tải chi tiết bài viết. Vui lòng thử lại.'
    article.value = null
    relatedArticles.value = []
    comments.value = []
  } finally {
    loading.value = false
  }
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
