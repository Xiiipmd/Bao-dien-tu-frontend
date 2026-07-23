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
          <label class="mb-2 block text-sm font-semibold text-gray-900">Ảnh bìa (URL)</label>
          <div class="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 transition-colors">
            <div class="text-center">
              <Upload class="mx-auto h-10 w-10 text-gray-400" />
              <p class="mt-4 text-sm text-gray-600">Frontend hiện gửi trực tiếp URL ảnh theo contract backend.</p>
              <p class="mt-2 text-xs text-gray-500">Dán đường dẫn ảnh vào ô bên dưới để dùng làm ảnh bìa.</p>
            </div>
          </div>
          <input
            v-model="form.coverImage"
            type="url"
            placeholder="https://example.com/cover-image.jpg"
            class="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p v-if="coverPreviewError" class="mt-2 text-sm text-red-600">{{ coverPreviewError }}</p>
          <div v-else-if="coverPreviewUrl" class="mt-3 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50">
            <div class="relative aspect-[16/9] bg-gray-100">
              <img
                :src="coverPreviewUrl"
                alt="Xem trước ảnh bìa"
                class="h-full w-full object-cover"
                @load="handleCoverImageLoad"
                @error="handleCoverImageError"
              />
              <div class="absolute bottom-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
                Ảnh bìa hợp lệ
              </div>
            </div>
            <p class="px-4 py-2 text-sm text-emerald-700">Đã nhận link ảnh. Ảnh này sẽ được dùng làm ảnh bìa.</p>
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
            </div>
            <textarea
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Upload, Save, Send } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createStaffArticle, fetchCategories, fetchManageableArticleDetail, updateStaffArticle, type CategoryOption } from '@/api/staff'

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

const articleId = computed(() => {
  const rawValue = route.params.articleId
  const parsedValue = Number(rawValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
})
const isEditing = computed(() => articleId.value !== null)

const form = reactive({
  title: '',
  categoryId: null as number | null,
  contentType: 'FREE' as 'FREE' | 'VIP',
  coverImage: '',
  excerpt: '',
  content: '',
})

onMounted(loadPageData)

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
  } catch (err: any) {
    loadError.value = err?.response?.data?.message ?? 'Không thể tải dữ liệu bài viết từ backend.'
  } finally {
    pageLoading.value = false
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
  coverPreviewError.value = 'Không tải được ảnh từ link này. Hãy thử mở link trong tab mới hoặc dùng link ảnh khác.'
}

async function handleCancelEdit() {
  await router.push({ path: '/admin/posts/manage', query: { cancelled: '1' } })
}
</script>
