<template>
  <div class="bg-gray-50 min-h-screen pb-16">
    <!-- Cover Image -->
    <div class="h-64 w-full bg-slate-800 relative">
      <img :src="author.cover" alt="Cover" class="h-full w-full object-cover opacity-60" />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
    </div>

    <div class="container mx-auto px-4 lg:px-8 max-w-5xl -mt-24 relative z-10">
      <!-- Author Info Card -->
      <div class="rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50 mb-10 border border-gray-100">
        <div class="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 mb-6">
          <img
            :src="author.avatar"
            :alt="author.name"
            class="h-32 w-32 rounded-full border-4 border-white object-cover bg-white shadow-md"
          />
          <div class="flex-1 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-1">{{ author.name }}</h1>
              <p class="text-blue-600 font-medium text-sm mb-2">{{ author.role }}</p>
            </div>
            <div class="flex gap-3 w-full md:w-auto">
              <button class="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700">
                <UserPlus class="h-4 w-4" /> Theo dõi
              </button>
              <button class="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
                <Mail class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-gray-100">
          <div class="md:col-span-2">
            <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Giới thiệu</h3>
            <p class="text-gray-700 leading-relaxed">{{ author.bio }}</p>
          </div>
          <div class="space-y-4">
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <Calendar class="h-5 w-5 text-gray-400" />
              <span>Tham gia: <strong class="text-gray-900">{{ author.joined }}</strong></span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <Users class="h-5 w-5 text-gray-400" />
              <span><strong class="text-gray-900">{{ author.followers.toLocaleString() }}</strong> Người theo dõi</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <UserPlus class="h-5 w-5 text-gray-400" />
              <span>Đang theo dõi <strong class="text-gray-900">{{ author.following }}</strong> người</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Author's Articles -->
      <div>
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Bài viết của {{ author.name }}</h2>
          <span class="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{{ authorArticles.length }} bài viết</span>
        </div>

        <div v-if="authorArticles.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ArticleCard v-for="article in authorArticles" :key="article.id" :article="article" />
        </div>
        <div v-else class="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          Tác giả này chưa có bài viết nào.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { UserPlus, Users, Calendar, Mail } from 'lucide-vue-next'
import { authors, articles } from '@/app/lib/mock-data'
import ArticleCard from '@/components/ArticleCard.vue'

const route = useRoute()
const id = computed(() => route.params.id as string)
const author = computed(() => authors.find(a => a.id === id.value) ?? authors[0])
const authorArticles = computed(() => articles.filter(a => a.authorId === id.value))
</script>
