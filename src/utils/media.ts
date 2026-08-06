const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov|m4v)$/i

export function isVideoMedia(source?: string | null) {
  if (!source) return false
  const cleanSource = source.trim().split(/[?#]/, 1)[0]
  return VIDEO_EXTENSIONS.test(cleanSource)
}
