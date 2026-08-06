<template>
  <video
    v-if="isVideoMedia(src)"
    :src="src"
    :aria-label="alt"
    :class="mediaClass"
    autoplay
    muted
    loop
    playsinline
    preload="metadata"
    disablepictureinpicture
    @loadeddata="$emit('load')"
    @error="$emit('error')"
  />
  <img
    v-else
    :src="src"
    :alt="alt"
    :class="mediaClass"
    loading="lazy"
    @load="$emit('load')"
    @error="$emit('error')"
  />
</template>

<script setup lang="ts">
import { isVideoMedia } from '@/utils/media'

withDefaults(defineProps<{
  src: string
  alt?: string
  mediaClass?: string
}>(), {
  alt: '',
  mediaClass: 'h-full w-full object-cover',
})

defineEmits<{
  load: []
  error: []
}>()
</script>
