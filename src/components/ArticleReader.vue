<template>
  <section class="article-reader" aria-label="Trình đọc bài báo tự động">
    <button
      type="button"
      class="reader-play-button"
      :disabled="!canPlay"
      :aria-label="isPlaying ? 'Tạm dừng đọc bài' : 'Nghe đọc bài'"
      @click="togglePlayback"
    >
      <Pause v-if="isPlaying" class="h-5 w-5 fill-current" />
      <Play v-else class="h-5 w-5 fill-current" />
      <span>{{ playButtonLabel }}</span>
    </button>

    <span class="min-w-11 text-sm tabular-nums text-gray-600" :title="`Thời lượng ước tính cho ${wordCount} từ`">
      {{ estimatedDuration }}
    </span>

    <label class="reader-field" title="Ngôn ngữ nội dung đọc">
      <Languages class="h-4 w-4 text-gray-500" />
      <select v-model="activeLanguage" aria-label="Ngôn ngữ nội dung đọc" @change="changeLanguage">
        <option value="vi">Tiếng Việt</option>
        <option value="en">English</option>
      </select>
    </label>

    <label class="reader-field" title="Tốc độ đọc">
      <Gauge class="h-4 w-4 text-gray-500" />
      <select v-model.number="rate" aria-label="Tốc độ đọc" @change="restartIfActive">
        <option v-for="option in rateOptions" :key="option" :value="option">{{ option.toFixed(1) }}x</option>
      </select>
    </label>

    <label class="reader-field min-w-0 flex-1 sm:max-w-64" title="Giọng đọc">
      <Mic class="h-4 w-4 shrink-0 text-gray-500" />
      <select v-model="selectedVoiceName" class="min-w-0 flex-1" aria-label="Giọng đọc" @change="restartIfActive">
        <option v-if="!availableVoices.length" value="">Không có giọng phù hợp</option>
        <option v-for="voice in availableVoices" :key="voice.voiceURI" :value="voice.name">
          {{ voiceLabel(voice) }}
        </option>
      </select>
    </label>

    <button
      v-if="hasStarted"
      type="button"
      class="reader-stop-button"
      title="Dừng và đọc lại từ đầu"
      aria-label="Dừng đọc bài"
      @click="stopReading"
    >
      <Square class="h-3.5 w-3.5 fill-current" />
    </button>

    <details class="reader-preview w-full">
      <summary>Xem nội dung sẽ đọc ({{ wordCount.toLocaleString('vi-VN') }} từ)</summary>
      <p v-if="translationLoading">Đang dịch toàn bộ nội dung bài sang tiếng Anh...</p>
      <p v-else>{{ readableText }}</p>
    </details>

    <p v-if="translationError" class="w-full text-xs text-red-600">{{ translationError }}</p>
    <p v-if="!supported" class="w-full text-xs text-red-600">
      Trình duyệt này chưa hỗ trợ chức năng đọc bài.
    </p>
    <p v-else-if="!availableVoices.length" class="w-full text-xs text-amber-700">
      Không tìm thấy giọng {{ activeLanguage === 'en' ? 'tiếng Anh' : 'tiếng Việt' }} trên trình duyệt.
      Vui lòng cài thêm giọng đọc cho hệ điều hành rồi tải lại trang.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Gauge, Languages, Mic, Pause, Play, Square } from 'lucide-vue-next'
import { translateArticleToEnglish } from '@/api/articles'

const props = defineProps<{
  title: string
  sapo?: string
  html: string
}>()

const rateOptions = [0.8, 1, 1.2, 1.5, 2]
const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
const availableVoices = ref<SpeechSynthesisVoice[]>([])
const selectedVoiceName = ref('')
const activeLanguage = ref<'vi' | 'en'>('vi')
const translatedText = ref('')
const translationLoading = ref(false)
const translationError = ref('')
const rate = ref(1)
const isPlaying = ref(false)
const hasStarted = ref(false)
const chunkIndex = ref(0)
let sessionId = 0

const sourceText = computed(() => {
  const parts = [props.title, props.sapo, extractReadableArticleText(props.html)]
  return parts.map(part => part?.trim()).filter(Boolean).join('. ')
})
const readableText = computed(() => activeLanguage.value === 'en' ? translatedText.value : sourceText.value)
const speechChunks = computed(() => splitSpeechText(readableText.value))
const wordCount = computed(() => readableText.value.match(/[\p{L}\p{N}]+/gu)?.length ?? 0)
const estimatedDuration = computed(() => {
  const seconds = wordCount.value ? Math.max(1, Math.round(wordCount.value / (155 * rate.value) * 60)) : 0
  return formatDuration(seconds)
})
const canPlay = computed(() => (
  supported
  && Boolean(sourceText.value)
  && availableVoices.value.length > 0
  && !translationLoading.value
))
const playButtonLabel = computed(() => {
  if (translationLoading.value) return 'Đang dịch...'
  if (isPlaying.value) return 'Tạm dừng'
  if (hasStarted.value) return 'Đọc tiếp'
  return 'Nghe đọc bài'
})

function loadVoices() {
  if (!supported) return
  const languagePrefix = activeLanguage.value === 'en' ? 'en' : 'vi'
  availableVoices.value = window.speechSynthesis.getVoices()
    .filter(voice => voice.lang.toLowerCase().startsWith(languagePrefix))

  if (!availableVoices.value.some(voice => voice.name === selectedVoiceName.value)) {
    selectedVoiceName.value = availableVoices.value.find(voice => voice.default)?.name
      ?? availableVoices.value[0]?.name
      ?? ''
  }
}

async function changeLanguage() {
  stopReading()
  translationError.value = ''
  selectedVoiceName.value = ''
  loadVoices()
  if (activeLanguage.value === 'en') await loadEnglishTranslation()
}

async function loadEnglishTranslation() {
  if (translatedText.value || translationLoading.value || !sourceText.value) return
  translationLoading.value = true
  translationError.value = ''
  try {
    const response = await translateArticleToEnglish(sourceText.value)
    translatedText.value = response.text.trim()
    if (!translatedText.value) throw new Error('Empty translation')
  } catch (error: any) {
    translationError.value = error?.response?.data?.message
      ?? 'Không thể dịch bài báo sang tiếng Anh. Vui lòng thử lại.'
  } finally {
    translationLoading.value = false
  }
}

function voiceLabel(voice: SpeechSynthesisVoice) {
  return `${voice.name} (${voice.lang})`
}

async function togglePlayback() {
  if (!supported || !sourceText.value) return

  if (isPlaying.value) {
    window.speechSynthesis.pause()
    isPlaying.value = false
    return
  }

  if (hasStarted.value && window.speechSynthesis.paused) {
    window.speechSynthesis.resume()
    isPlaying.value = true
    return
  }

  if (activeLanguage.value === 'en' && !translatedText.value) await loadEnglishTranslation()
  if (!readableText.value || !availableVoices.value.length) return

  if (chunkIndex.value >= speechChunks.value.length) chunkIndex.value = 0
  cancelSpeech()
  hasStarted.value = true
  isPlaying.value = true
  const activeSession = sessionId
  window.setTimeout(() => speakCurrentChunk(activeSession), 0)
}

function speakCurrentChunk(activeSession: number) {
  if (!supported || activeSession !== sessionId) return
  const text = speechChunks.value[chunkIndex.value]
  if (!text) {
    finishReading()
    return
  }

  const selectedVoice = availableVoices.value.find(voice => voice.name === selectedVoiceName.value)
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate.value
  utterance.voice = selectedVoice ?? null
  utterance.lang = selectedVoice?.lang ?? (activeLanguage.value === 'en' ? 'en-US' : 'vi-VN')
  utterance.onend = () => {
    if (activeSession !== sessionId) return
    chunkIndex.value += 1
    speakCurrentChunk(activeSession)
  }
  utterance.onerror = event => {
    if (activeSession !== sessionId || event.error === 'canceled' || event.error === 'interrupted') return
    finishReading()
  }
  window.speechSynthesis.speak(utterance)
}

function restartIfActive() {
  if (!hasStarted.value) return
  const shouldContinue = isPlaying.value
  cancelSpeech()
  chunkIndex.value = 0
  hasStarted.value = shouldContinue
  isPlaying.value = shouldContinue
  if (shouldContinue) speakCurrentChunk(sessionId)
}

function stopReading() {
  cancelSpeech()
  chunkIndex.value = 0
  hasStarted.value = false
  isPlaying.value = false
}

function finishReading() {
  chunkIndex.value = speechChunks.value.length
  hasStarted.value = false
  isPlaying.value = false
}

function cancelSpeech() {
  sessionId += 1
  if (supported) window.speechSynthesis.cancel()
}

watch(sourceText, () => {
  stopReading()
  translatedText.value = ''
  translationError.value = ''
  if (activeLanguage.value === 'en') void loadEnglishTranslation()
})

onMounted(() => {
  loadVoices()
  if (supported) window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
})

onBeforeUnmount(() => {
  cancelSpeech()
  if (supported) window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
})

function extractReadableArticleText(html: string) {
  if (!html) return ''
  const documentNode = new DOMParser().parseFromString(html, 'text/html')

  documentNode.querySelectorAll([
    'figure', 'figcaption', 'img', 'picture', 'video', 'audio', 'source',
    'script', 'style', 'noscript', '[aria-hidden="true"]', '[data-caption]',
    '.caption', '.image-caption', '.photo-caption', '.image-description', '.photo-description',
  ].join(',')).forEach(node => node.remove())

  const readableSelector = 'h2, h3, h4, p, li, blockquote'
  const leafBlocks = Array.from(documentNode.body.querySelectorAll(readableSelector))
    .filter(node => !node.querySelector(readableSelector))
  const text = leafBlocks.length
    ? leafBlocks.map(node => node.textContent ?? '').join('. ')
    : documentNode.body.textContent ?? ''

  return normalizeSpeechText(text)
}

function normalizeSpeechText(value: string) {
  return value
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function splitSpeechText(value: string, maxLength = 220) {
  if (!value) return []
  const sentences = value.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? [value]
  const chunks: string[] = []
  let current = ''

  sentences.forEach(sentence => {
    const cleanSentence = sentence.trim()
    if (!cleanSentence) return
    if (current && current.length + cleanSentence.length + 1 > maxLength) {
      chunks.push(current)
      current = ''
    }
    if (cleanSentence.length <= maxLength) {
      current = current ? `${current} ${cleanSentence}` : cleanSentence
      return
    }
    cleanSentence.split(/,\s+|;\s+/).forEach(part => {
      if (current && current.length + part.length + 2 > maxLength) {
        chunks.push(current)
        current = ''
      }
      current = current ? `${current}, ${part}` : part
    })
  })

  if (current) chunks.push(current)
  return chunks
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
</script>

<style scoped>
.article-reader { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; border: 1px solid #e5e7eb; border-radius: .75rem; background: #f3f4f6; padding: .5rem; }
.reader-play-button { display: inline-flex; min-height: 2.5rem; align-items: center; gap: .5rem; border-radius: .5rem; padding: .45rem .75rem; font-weight: 700; color: #374151; transition: background-color .2s, color .2s; }
.reader-play-button:hover:not(:disabled) { background: #fff; color: #2563eb; }
.reader-play-button:disabled { cursor: not-allowed; opacity: .45; }
.reader-field { display: inline-flex; min-height: 2.5rem; align-items: center; gap: .4rem; border: 1px solid #d1d5db; border-radius: .5rem; background: #fff; padding: 0 .55rem; }
.reader-field select { border: 0; background: transparent; color: #374151; font-size: .875rem; outline: none; }
.reader-stop-button { display: inline-flex; height: 2.5rem; width: 2.5rem; align-items: center; justify-content: center; border-radius: .5rem; color: #6b7280; }
.reader-stop-button:hover { background: #fee2e2; color: #dc2626; }
.reader-preview { border-top: 1px solid #d1d5db; padding: .5rem .25rem 0; color: #4b5563; font-size: .75rem; }
.reader-preview summary { width: fit-content; cursor: pointer; font-weight: 600; color: #2563eb; }
.reader-preview p { max-height: 12rem; margin-top: .5rem; overflow: auto; border-radius: .5rem; background: #fff; padding: .75rem; line-height: 1.6; white-space: pre-wrap; }
:global(html.dark) .article-reader { border-color: #334155; background: #1e293b; }
:global(html.dark) .reader-play-button { color: #e2e8f0; }
:global(html.dark) .reader-play-button:hover:not(:disabled) { background: #334155; color: #93c5fd; }
:global(html.dark) .reader-field { border-color: #475569; background: #0f172a; }
:global(html.dark) .reader-field select { color: #e2e8f0; }
:global(html.dark) .reader-preview { border-color: #475569; color: #cbd5e1; }
:global(html.dark) .reader-preview p { background: #0f172a; }
</style>
