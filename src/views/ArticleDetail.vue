<template>
  <div class="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <!-- Main Content -->
      <div class="lg:col-span-8">
        <header class="mb-8">
          <div class="mb-4 flex items-center gap-2">
            <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 uppercase tracking-wider">
              {{ article.category }}
            </span>
            <span v-if="article.isVip" class="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              <Crown class="h-3 w-3" /> VIP
            </span>
          </div>

          <h1 class="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">{{ article.title }}</h1>

          <div class="flex flex-wrap items-center gap-6 border-y border-gray-100 py-4 text-sm text-gray-600">
            <RouterLink :to="`/author/${article.authorId}`" class="flex items-center gap-2 group">
              <img v-if="author" :src="author.avatar" :alt="author.name" class="h-6 w-6 rounded-full object-cover bg-gray-100" />
              <User v-else class="h-4 w-4" />
              <span class="font-medium group-hover:text-blue-600 transition-colors">{{ article.author }}</span>
            </RouterLink>
            <div class="flex items-center gap-2">
              <Calendar class="h-4 w-4" />
              <span>{{ article.date }}</span>
            </div>
            <div class="ml-auto flex items-center gap-3">
              <button class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Sparkles class="h-4 w-4 text-purple-500" /> Tóm tắt AI
              </button>
              <button class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Download class="h-4 w-4" /> Tải PDF
              </button>
            </div>
          </div>
        </header>

        <div class="mb-10 aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
          <img :src="article.image" :alt="article.title" class="h-full w-full object-cover" />
        </div>

        <div class="relative">
          <div
            :class="['prose prose-lg max-w-none prose-p:text-gray-700 prose-headings:text-gray-900', showVipOverlay ? 'max-h-[300px] overflow-hidden' : '']"
            v-html="article.content"
          />

          <!-- VIP Overlay -->
          <template v-if="showVipOverlay">
            <div class="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent backdrop-blur-[2px]" />
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
              <button type="submit" class="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700">
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
              <div class="h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, User, Crown, Download, Sparkles, MessageSquare, Send } from 'lucide-vue-next'
import { articles, comments as initialComments, authors } from '@/lib/mock-data'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const id = computed(() => route.params.id as string)
const article = computed(() => articles.find(a => a.id === id.value) ?? articles[0])
const author = computed(() => authors.find(a => a.id === article.value.authorId))
const relatedArticles = computed(() => articles.filter(a => a.id !== id.value).slice(0, 4))
const showVipOverlay = computed(() => article.value.isVip && !auth.isVip)

const commentText = ref('')
const commentError = ref('')
const comments = ref([...initialComments])

function handleCommentSubmit() {
  if (commentText.value.trim().length < 5) {
    commentError.value = 'Bình luận quá ngắn, vui lòng nhập nội dung có ý nghĩa.'
    return
  }
  if (commentText.value.includes('spam')) {
    commentError.value = 'Nội dung chứa từ khóa không hợp lệ (spam).'
    return
  }
  commentError.value = ''
  comments.value.unshift({
    id: Date.now(),
    user: 'Người dùng',
    avatar: 'https://i.pravatar.cc/150?u=new',
    content: commentText.value,
    time: 'Vừa xong',
  })
  commentText.value = ''
}
</script>
