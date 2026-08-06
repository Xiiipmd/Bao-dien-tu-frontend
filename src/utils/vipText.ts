/**
 * Repairs legacy VIP descriptions that were saved with Vietnamese characters
 * replaced by question marks. Those characters cannot be decoded again, so
 * known legacy package copy is restored from its duration and text signature.
 */
export function normalizeVipDescription(description: string | null | undefined, durationDays: number) {
  const value = description?.trim() ?? ''

  if (durationDays === 180 && /Gói VIP 180 ngày/i.test(value) && value.includes('?')) {
    return 'Gói VIP 180 ngày đọc báo không giới hạn và tóm tắt nhanh bằng AI. Tiết kiệm chi phí!'
  }

  return value
}
