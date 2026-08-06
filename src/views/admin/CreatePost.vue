<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">{{ isEditing ? 'Chỉnh sửa bài viết' : 'Viết bài mới' }}</h2>
      <div class="flex items-center gap-3">
        <button
          v-if="isEditing"
          @click="handleCancelEdit"
          class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button @click="resetForm" class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Save class="h-4 w-4" /> Làm mới
        </button>
        <button :disabled="submitting || (isEditing && !!loadError)" @click="handlePublish" class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60">
          <Send class="h-4 w-4" /> {{ submitting ? 'Đang gửi...' : (isEditing ? 'Cập nhật và gửi lại duyệt' : 'Xuất bản') }}
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-gray-100 bg-white shadow-sm p-8">
      <div v-if="pageLoading" class="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">Đang tải dữ liệu bài viết...</div>
      <div v-if="loadError" class="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{{ loadError }}</div>
      <div v-if="isEditing && rejectionReason" class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <p class="font-semibold">Lý do bị từ chối</p>
        <p class="mt-1">{{ rejectionReason }}</p>
      </div>
      <div v-if="successMessage" class="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</div>
      <div v-if="formError" class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ formError }}</div>
      <div v-if="draftRestored || draftSavedAt" class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <span>
          {{ draftRestored ? 'Đã khôi phục bản nháp chưa hoàn thành.' : `Đã tự lưu bản nháp lúc ${draftSavedAt}.` }}
        </span>
        <button type="button" class="font-semibold text-red-600 hover:underline" @click="discardDraft">Xóa bản nháp</button>
      </div>

      <form @submit.prevent class="space-y-6">
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-900">Tiêu đề bài viết</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Nhập tiêu đề bài viết"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-900">Danh mục</label>
            <select v-model.number="form.categoryId" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Chọn danh mục</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
            <div v-if="categories.length === 0" class="mt-3 space-y-2">
              <p class="text-sm text-amber-700">Không tải được danh sách danh mục từ backend. Bạn vẫn có thể nhập trực tiếp mã danh mục.</p>
              <input v-model.number="form.categoryId" type="number" min="1" placeholder="Nhập mã danh mục" class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-900">Loại nội dung</label>
            <div class="flex h-12.5 items-center gap-6 rounded-lg border border-gray-300 px-4">
              <label class="flex cursor-pointer items-center gap-2">
                <input v-model="form.contentType" type="radio" value="FREE" class="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <span class="text-sm font-medium text-gray-700">Miễn phí</span>
              </label>
              <label class="flex cursor-pointer items-center gap-2">
                <input v-model="form.contentType" type="radio" value="VIP" class="h-4 w-4 text-amber-600 focus:ring-amber-500" />
                <span class="text-sm font-medium text-amber-600">Bài viết VIP</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-900">Ảnh hoặc video bìa (URL)</label>
          <div class="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 transition-colors">
            <div class="text-center">
              <Upload class="mx-auto h-10 w-10 text-gray-400" />
              <p class="mt-4 text-sm text-gray-600">Hỗ trợ ảnh hoặc video MP4, WebM và OGG.</p>
              <p class="mt-2 text-xs text-gray-500">Video sẽ tự phát, tắt tiếng và lặp lại trên bài viết.</p>
            </div>
          </div>
          <input
            v-model="form.coverImage"
            type="url"
            placeholder="https://example.com/cover-image.jpg hoặc cover-video.mp4"
            class="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p v-if="coverPreviewError" class="mt-2 text-sm text-red-600">{{ coverPreviewError }}</p>
          <div v-else-if="coverPreviewUrl" class="mt-3 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50">
            <div class="relative aspect-[16/9] bg-gray-100">
              <CoverMedia
                :src="coverPreviewUrl"
                alt="Xem trước media bìa"
                media-class="h-full w-full object-cover"
                @load="handleCoverImageLoad"
                @error="handleCoverImageError"
              />
              <div class="absolute bottom-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
                {{ isVideoMedia(coverPreviewUrl) ? 'Video bìa hợp lệ' : 'Ảnh bìa hợp lệ' }}
              </div>
            </div>
            <p class="px-4 py-2 text-sm text-emerald-700">Đã nhận link media. Nội dung này sẽ được dùng làm bìa bài viết.</p>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-900">Tóm tắt ngắn</label>
          <textarea
            v-model="form.excerpt"
            rows="3"
            placeholder="Viết một đoạn tóm tắt ngắn để thu hút người đọc..."
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-900">Nội dung bài viết</label>
          <div class="rounded-lg border border-gray-300 overflow-hidden">
            <div class="bg-gray-50 border-b border-gray-300 p-2 flex gap-2">
              <button v-for="btn in ['B', 'I', 'U']" :key="btn" type="button" class="h-8 w-8 rounded font-serif font-bold text-gray-700 hover:bg-gray-200">{{ btn }}</button>
              <div class="w-px bg-gray-300 mx-1"></div>
              <button type="button" class="px-3 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-200">H1</button>
              <button type="button" class="px-3 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-200">H2</button>
              <div class="w-px bg-gray-300 mx-1"></div>
              <button
                type="button"
                class="flex items-center gap-2 rounded px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                @click="toggleImagePanel"
              >
                <ImagePlus class="h-4 w-4" /> Chèn ảnh
              </button>
            </div>

            <div v-if="imagePanelOpen" class="border-b border-gray-300 bg-blue-50/60 p-4">
              <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                  <span class="mb-2 block text-sm font-semibold text-gray-900">Nguồn ảnh trong nội dung</span>
                  <div class="mb-3 grid grid-cols-2 gap-2 rounded-lg bg-white p-1">
                    <button type="button" :class="['rounded-md px-3 py-2 text-sm font-semibold', contentImageSourceMode === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100']" @click="contentImageSourceMode = 'upload'">Tải ảnh lên</button>
                    <button type="button" :class="['rounded-md px-3 py-2 text-sm font-semibold', contentImageSourceMode === 'url' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100']" @click="contentImageSourceMode = 'url'">Dán link ảnh</button>
                  </div>
                  <label v-if="contentImageSourceMode === 'upload'" class="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-white p-4 text-center transition hover:border-blue-500 hover:bg-blue-50">
                    <ImagePlus class="mb-2 h-7 w-7 text-blue-500" />
                    <span class="text-sm font-medium text-gray-700">{{ contentImageFile?.name || 'JPEG, PNG hoặc WebP, tối đa 5 MB' }}</span>
                    <input
                      ref="contentImageInput"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      class="sr-only"
                      @change="handleContentImageSelect"
                    />
                  </label>
                  <label v-else class="block">
                    <span class="sr-only">URL ảnh</span>
                    <input
                      v-model="contentImageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      @input="contentImageError = ''"
                    />
                    <span class="mt-2 block text-xs leading-5 text-gray-500">Dùng link trực tiếp tới ảnh JPG, PNG, WebP hoặc GIF. Không dùng link trang web chứa ảnh.</span>
                  </label>
                </div>

                <div class="space-y-3">
                  <label class="block">
                    <span class="mb-2 block text-sm font-semibold text-gray-900">Vị trí chèn ảnh</span>
                    <select
                      v-model="contentImagePosition"
                      class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="cursor">Tại vị trí con trỏ</option>
                      <option value="start">Đầu bài viết</option>
                      <option value="end">Cuối bài viết</option>
                    </select>
                    <span v-if="contentImagePosition === 'cursor'" class="mt-1 block text-xs text-blue-700">
                      Đã ghi nhớ vị trí ký tự {{ savedContentCursor }} trong nội dung.
                    </span>
                  </label>
                  <label class="block">
                    <span class="mb-2 block text-sm font-semibold text-gray-900">Mô tả ảnh</span>
                    <input
                      v-model="contentImageCaption"
                      type="text"
                      maxlength="300"
                      placeholder="Ví dụ: Khách tham quan tại triển lãm công nghệ"
                      class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </label>
                  <p class="text-xs leading-5 text-gray-500">Mô tả sẽ hiển thị dưới ảnh và được dùng làm nội dung thay thế cho người dùng trình đọc màn hình.</p>
                  <button
                    type="button"
                    :disabled="contentImageUploading || !canInsertContentImage"
                    class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    @click="uploadAndInsertContentImage"
                  >
                    <LoaderCircle v-if="contentImageUploading" class="h-4 w-4 animate-spin" />
                    <ImagePlus v-else class="h-4 w-4" />
                    {{ contentImageUploading ? 'Đang tải ảnh...' : (contentImageSourceMode === 'url' ? 'Chèn link ảnh vào bài' : 'Tải lên và chèn vào bài') }}
                  </button>
                </div>
              </div>

              <p v-if="contentImageError" class="mt-3 text-sm text-red-600">{{ contentImageError }}</p>
              <figure v-if="contentImagePreviewSource" class="mt-4 overflow-hidden rounded-lg border border-blue-200 bg-white p-3">
                <img :src="contentImagePreviewSource" :alt="contentImageCaption || 'Xem trước ảnh nội dung'" class="mx-auto max-h-72 rounded-md object-contain" @error="contentImageError = 'Không tải được ảnh từ link này.'" />
                <figcaption v-if="contentImageCaption" class="mt-2 text-center text-sm italic text-gray-600">{{ contentImageCaption }}</figcaption>
              </figure>
            </div>
            <textarea
              ref="contentTextarea"
              v-model="form.content"
              rows="15"
              placeholder="Bắt đầu viết nội dung tại đây..."
              class="w-full p-4 text-gray-800 focus:outline-none resize-y"
            ></textarea>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Upload, Save, Send, ImagePlus, LoaderCircle } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createStaffArticle, fetchCategories, fetchManageableArticleDetail, updateStaffArticle, type CategoryOption } from '@/api/staff'
import { uploadArticleImage } from '@/api/media'
import CoverMedia from '@/components/CoverMedia.vue'
import { isVideoMedia } from '@/utils/media'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const categories = ref<CategoryOption[]>([])
const loadError = ref('')
const formError = ref('')
const successMessage = ref('')
const submitting = ref(false)
const pageLoading = ref(false)
const rejectionReason = ref('')
const editingArticleStatus = ref<string | null>(null)
const coverPreviewUrl = ref('')
const coverPreviewError = ref('')
const contentTextarea = ref<HTMLTextAreaElement | null>(null)
const contentImageInput = ref<HTMLInputElement | null>(null)
const imagePanelOpen = ref(false)
const contentImageFile = ref<File | null>(null)
const contentImageCaption = ref('')
const contentImagePreview = ref('')
const contentImageError = ref('')
const contentImageUploading = ref(false)
const contentImagePosition = ref<'cursor' | 'start' | 'end'>('cursor')
const savedContentCursor = ref(0)
const contentImageSourceMode = ref<'upload' | 'url'>('upload')
const contentImageUrl = ref('')
const draftReady = ref(false)
const draftRestored = ref(false)
const draftSavedAt = ref('')
let draftSaveTimer: number | undefined

const articleId = computed(() => {
  const rawValue = route.params.articleId
  const parsedValue = Number(rawValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
})
const isEditing = computed(() => articleId.value !== null)
const contentImagePreviewSource = computed(() =>
  contentImageSourceMode.value === 'url' ? contentImageUrl.value.trim() : contentImagePreview.value,
)
const canInsertContentImage = computed(() =>
  !contentImageError.value && Boolean(contentImageCaption.value.trim()) && (
    contentImageSourceMode.value === 'url'
      ? Boolean(contentImageUrl.value.trim())
      : Boolean(contentImageFile.value)
  ),
)
const draftStorageKey = computed(() =>
  `newsdaily:post-draft:${auth.userId ?? 'anonymous'}:${articleId.value ?? 'new'}`,
)

const form = reactive({
  title: '',
  categoryId: null as number | null,
  contentType: 'FREE' as 'FREE' | 'VIP',
  coverImage: '',
  excerpt: '',
  content: '',
})

onMounted(loadPageData)
onBeforeUnmount(() => {
  flushDraftSave()
  revokeContentImagePreview()
})

watch(
  () => ({
    ...form,
    contentImageCaption: contentImageCaption.value,
    contentImageUrl: contentImageUrl.value,
    contentImageSourceMode: contentImageSourceMode.value,
    contentImagePosition: contentImagePosition.value,
    imagePanelOpen: imagePanelOpen.value,
  }),
  scheduleDraftSave,
  { deep: true },
)

watch(
  () => form.coverImage,
  (value) => {
    const imageUrl = value.trim()
    coverPreviewUrl.value = ''
    coverPreviewError.value = ''

    if (!imageUrl) {
      return
    }

    try {
      const parsedUrl = new URL(imageUrl)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        coverPreviewError.value = 'Link ảnh phải bắt đầu bằng http:// hoặc https://.'
        return
      }
      coverPreviewUrl.value = imageUrl
    } catch {
      coverPreviewError.value = 'Link ảnh không hợp lệ. Hãy dán URL đầy đủ của ảnh.'
    }
  },
)

async function loadPageData() {
  pageLoading.value = true
  draftReady.value = false
  loadError.value = ''
  try {
    const [categoryList, articleDetail] = await Promise.all([
      fetchCategories(),
      articleId.value ? fetchManageableArticleDetail(articleId.value) : Promise.resolve(null),
    ])

    categories.value = categoryList

    if (articleDetail) {
      editingArticleStatus.value = articleDetail.status
      rejectionReason.value = articleDetail.rejectionReason ?? ''
      Object.assign(form, {
        title: articleDetail.title,
        categoryId: articleDetail.categoryId,
        contentType: articleDetail.type,
        coverImage: articleDetail.coverImage,
        excerpt: articleDetail.sapo,
        content: articleDetail.content,
      })
    }
    restoreDraft()
  } catch (err: any) {
    loadError.value = err?.response?.data?.message ?? 'Không thể tải dữ liệu bài viết từ backend.'
  } finally {
    pageLoading.value = false
    draftReady.value = true
  }
}

async function loadCategories() {
  try {
    categories.value = await fetchCategories()
  } catch (err: any) {
    loadError.value = err?.response?.data?.message ?? 'Không thể tải danh mục từ backend. Bạn vẫn có thể nhập thủ công mã danh mục.'
  }
}

async function handlePublish() {
  formError.value = ''
  successMessage.value = ''

  if (!auth.userId) {
    formError.value = 'Không xác định được người dùng hiện tại từ phiên đăng nhập.'
    return
  }

  if (!form.title.trim() || !form.categoryId || !form.coverImage.trim() || !form.excerpt.trim() || !form.content.trim()) {
    formError.value = 'Vui lòng điền đầy đủ tiêu đề, danh mục, ảnh bìa, tóm tắt và nội dung.'
    return
  }

  if (coverPreviewError.value) {
    formError.value = coverPreviewError.value
    return
  }

  submitting.value = true
  try {
    if (isEditing.value && articleId.value) {
      const updatedArticle = await updateStaffArticle(articleId.value, {
        categoryId: form.categoryId,
        coverImage: form.coverImage.trim(),
        title: form.title.trim(),
        sapo: form.excerpt.trim(),
        content: form.content.trim(),
        type: form.contentType,
      })
      editingArticleStatus.value = updatedArticle.status
      rejectionReason.value = updatedArticle.rejectionReason ?? ''
      clearSavedDraft()
      await router.push({ path: '/admin/posts/manage', query: { updated: '1' } })
      return
    } else {
      await createStaffArticle({
        authorId: auth.userId,
        categoryId: form.categoryId,
        coverImage: form.coverImage.trim(),
        title: form.title.trim(),
        sapo: form.excerpt.trim(),
        content: form.content.trim(),
        type: form.contentType,
      })
      successMessage.value = 'Bài viết đã được gửi đi để duyệt.'
      resetForm()
    }
  } catch (err: any) {
    formError.value = err?.response?.data?.message ?? 'Không thể gửi bài viết. Vui lòng thử lại.'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  clearSavedDraft()
  clearContentImage()
  imagePanelOpen.value = false
  if (isEditing.value) {
    void loadPageData()
    return
  }

  Object.assign(form, {
    title: '',
    categoryId: null,
    contentType: 'FREE',
    coverImage: '',
    excerpt: '',
    content: '',
  })
}

function handleCoverImageLoad() {
  coverPreviewError.value = ''
}

function handleCoverImageError() {
  coverPreviewError.value = 'Không tải được ảnh hoặc video từ link này. Hãy kiểm tra link trực tiếp và quyền truy cập của CDN.'
}

function handleContentImageSelect(event: Event) {
  contentImageError.value = ''
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    contentImageError.value = 'Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.'
    input.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    contentImageError.value = 'Ảnh trong nội dung không được vượt quá 5 MB.'
    input.value = ''
    return
  }

  revokeContentImagePreview()
  contentImageFile.value = file
  contentImagePreview.value = URL.createObjectURL(file)
}

function toggleImagePanel() {
  if (!imagePanelOpen.value) {
    savedContentCursor.value = contentTextarea.value?.selectionStart ?? form.content.length
  }
  imagePanelOpen.value = !imagePanelOpen.value
}

async function uploadAndInsertContentImage() {
  if (!canInsertContentImage.value) {
    contentImageError.value = 'Vui lòng chọn ảnh hoặc nhập link ảnh và điền mô tả.'
    return
  }

  contentImageUploading.value = true
  contentImageError.value = ''
  try {
    let source = contentImageUrl.value.trim()
    if (contentImageSourceMode.value === 'upload') {
      if (!contentImageFile.value) return
      const uploaded = await uploadArticleImage(contentImageFile.value)
      source = uploaded.path
    } else {
      const parsedUrl = new URL(source)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('INVALID_IMAGE_URL')
      }
      if (isVideoMedia(source)) {
        contentImageError.value = 'Link này là video. Vui lòng dùng link ảnh JPG, PNG, WebP hoặc GIF cho nội dung.'
        return
      }
    }
    const caption = escapeHtml(contentImageCaption.value.trim())
    const imagePath = escapeHtml(source)
    const figureHtml = `\n<figure class="article-figure"><img src="${imagePath}" alt="${caption}" loading="lazy"><figcaption>${caption}</figcaption></figure>\n`
    insertContentAtCursor(figureHtml)
    clearContentImage()
    imagePanelOpen.value = false
  } catch (err: any) {
    contentImageError.value = err?.message === 'INVALID_IMAGE_URL'
      ? 'Link ảnh không hợp lệ. Link phải bắt đầu bằng http:// hoặc https://.'
      : err?.response?.data?.message ?? 'Không thể tải hoặc chèn ảnh. Vui lòng thử lại.'
  } finally {
    contentImageUploading.value = false
  }
}

function insertContentAtCursor(value: string) {
  const textarea = contentTextarea.value
  const start = contentImagePosition.value === 'start'
    ? 0
    : contentImagePosition.value === 'end'
      ? form.content.length
      : Math.min(savedContentCursor.value, form.content.length)
  const end = start
  form.content = `${form.content.slice(0, start)}${value}${form.content.slice(end)}`

  void nextTick(() => {
    const cursor = start + value.length
    textarea?.focus()
    textarea?.setSelectionRange(cursor, cursor)
  })
}

function clearContentImage() {
  revokeContentImagePreview()
  contentImageFile.value = null
  contentImageCaption.value = ''
  contentImageUrl.value = ''
  contentImageSourceMode.value = 'upload'
  contentImagePosition.value = 'cursor'
  contentImageError.value = ''
  if (contentImageInput.value) contentImageInput.value.value = ''
}

function revokeContentImagePreview() {
  if (contentImagePreview.value) URL.revokeObjectURL(contentImagePreview.value)
  contentImagePreview.value = ''
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function scheduleDraftSave() {
  if (!draftReady.value) return
  if (draftSaveTimer) window.clearTimeout(draftSaveTimer)
  draftSaveTimer = window.setTimeout(saveDraft, 600)
}

function flushDraftSave() {
  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer)
    draftSaveTimer = undefined
  }
  if (draftReady.value) saveDraft()
}

function saveDraft() {
  draftSaveTimer = undefined
  const hasContent = Boolean(
    form.title.trim() || form.coverImage.trim() || form.excerpt.trim() || form.content.trim()
    || form.categoryId || contentImageCaption.value.trim() || contentImageUrl.value.trim(),
  )
  if (!hasContent) {
    localStorage.removeItem(draftStorageKey.value)
    draftSavedAt.value = ''
    return
  }

  const savedAt = new Date().toISOString()
  try {
    localStorage.setItem(draftStorageKey.value, JSON.stringify({
      version: 1,
      savedAt,
      form: { ...form },
      imagePanelOpen: imagePanelOpen.value,
      contentImageCaption: contentImageCaption.value,
      contentImageUrl: contentImageUrl.value,
      contentImageSourceMode: contentImageSourceMode.value,
      contentImagePosition: contentImagePosition.value,
    }))
    draftSavedAt.value = formatDraftTime(savedAt)
    draftRestored.value = false
  } catch {
    formError.value = 'Không thể tự lưu bản nháp trong trình duyệt này.'
  }
}

function restoreDraft() {
  const rawDraft = localStorage.getItem(draftStorageKey.value)
  if (!rawDraft) return

  try {
    const draft = JSON.parse(rawDraft)
    if (!draft?.form || typeof draft.form !== 'object') return
    Object.assign(form, {
      title: draft.form.title ?? form.title,
      categoryId: draft.form.categoryId ?? form.categoryId,
      contentType: draft.form.contentType === 'VIP' ? 'VIP' : 'FREE',
      coverImage: draft.form.coverImage ?? form.coverImage,
      excerpt: draft.form.excerpt ?? form.excerpt,
      content: draft.form.content ?? form.content,
    })
    imagePanelOpen.value = Boolean(draft.imagePanelOpen)
    contentImageCaption.value = draft.contentImageCaption ?? ''
    contentImageUrl.value = draft.contentImageUrl ?? ''
    contentImageSourceMode.value = draft.contentImageSourceMode === 'url' ? 'url' : 'upload'
    contentImagePosition.value = ['start', 'end'].includes(draft.contentImagePosition)
      ? draft.contentImagePosition
      : 'cursor'
    draftSavedAt.value = formatDraftTime(draft.savedAt)
    draftRestored.value = true
  } catch {
    localStorage.removeItem(draftStorageKey.value)
  }
}

function clearSavedDraft() {
  if (draftSaveTimer) window.clearTimeout(draftSaveTimer)
  draftSaveTimer = undefined
  localStorage.removeItem(draftStorageKey.value)
  draftSavedAt.value = ''
  draftRestored.value = false
}

function discardDraft() {
  resetForm()
}

function formatDraftTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

async function handleCancelEdit() {
  await router.push({ path: '/admin/posts/manage', query: { cancelled: '1' } })
}
</script>
