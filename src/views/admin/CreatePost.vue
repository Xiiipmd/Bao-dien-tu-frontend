<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Viết bài mới</h2>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Save class="h-4 w-4" /> Lưu nháp
        </button>
        <button @click="handlePublish" class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Send class="h-4 w-4" /> Xuất bản
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-gray-100 bg-white shadow-sm p-8">
      <form @submit.prevent class="space-y-6">
        <!-- Title -->
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-900">Tiêu đề bài viết</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Nhập tiêu đề (tối đa 100 ký tự)"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Category -->
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-900">Danh mục</label>
            <select v-model="form.category" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="">Chọn danh mục</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <!-- VIP Toggle -->
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-900">Loại nội dung</label>
            <div class="flex h-[50px] items-center gap-6 rounded-lg border border-gray-300 px-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.contentType" type="radio" value="free" class="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <span class="text-sm font-medium text-gray-700">Miễn phí</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.contentType" type="radio" value="vip" class="h-4 w-4 text-amber-600 focus:ring-amber-500" />
                <span class="text-sm font-medium text-amber-600">Bài viết VIP</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Cover Image -->
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-900">Ảnh bìa (Cover)</label>
          <div class="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 hover:bg-gray-50 transition-colors cursor-pointer">
            <div class="text-center">
              <Upload class="mx-auto h-10 w-10 text-gray-400" />
              <div class="mt-4 flex text-sm text-gray-600">
                <span class="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500">Tải ảnh lên</span>
                <p class="pl-1">hoặc kéo thả vào đây</p>
              </div>
              <p class="text-xs text-gray-500 mt-2">PNG, JPG, GIF lên đến 5MB</p>
            </div>
          </div>
        </div>

        <!-- Excerpt -->
        <div>
          <label class="mb-2 block text-sm font-semibold text-gray-900">Tóm tắt ngắn</label>
          <textarea
            v-model="form.excerpt"
            rows="3"
            placeholder="Viết một đoạn tóm tắt ngắn để thu hút người đọc..."
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        <!-- Content Editor -->
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
import { reactive } from 'vue'
import { Upload, Save, Send } from 'lucide-vue-next'
import { categories } from '@/app/lib/mock-data'

const form = reactive({
  title: '',
  category: '',
  contentType: 'free',
  excerpt: '',
  content: '',
})

function handlePublish() {
  if (!form.title.trim() || !form.category || !form.content.trim()) {
    alert('Vui lòng điền đầy đủ tiêu đề, danh mục và nội dung.')
    return
  }
  alert('Bài viết đã được gửi đi để duyệt.')
}
</script>
