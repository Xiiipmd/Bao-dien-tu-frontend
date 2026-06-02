import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('jwt_token'))
  const userName = ref<string | null>(localStorage.getItem('user_name'))
  const role = ref<string | null>(localStorage.getItem('user_role'))
  const vipExpiryDate = ref<string | null>(localStorage.getItem('vip_expiry'))
  const userId = computed<number | null>(() => decodeUserId(token.value))

  const isLoggedIn = computed(() => !!token.value)
  const isVip = computed(() => {
    if (!vipExpiryDate.value) return false
    return new Date(vipExpiryDate.value) > new Date()
  })
  const isAdmin = computed(() => role.value === 'ADMIN')
  const isAuthor = computed(() => role.value === 'AUTHOR')
  const isCensor = computed(() => role.value === 'CENSOR')
  const isStaff = computed(() => ['ADMIN', 'AUTHOR', 'CENSOR'].includes(role.value ?? ''))

  async function login(email: string, password: string) {
    clearSession()
    const res = await api.post('/api/auth/login', { email, password })
    const data = res.data
    token.value = data.jwtToken
    userName.value = data.name
    role.value = data.role
    vipExpiryDate.value = data.vipExpiryDate ?? null
    localStorage.setItem('jwt_token', data.jwtToken)
    localStorage.setItem('user_name', data.name)
    localStorage.setItem('user_role', data.role)
    if (data.vipExpiryDate) {
      localStorage.setItem('vip_expiry', data.vipExpiryDate)
    }
    return data
  }

  async function register(payload: {
    email: string
    name: string
    password: string
    confirmation: string
  }) {
    await api.post('/api/auth/register', payload)
  }

  function logout() {
    clearSession()
  }

  function clearSession() {
    token.value = null
    userName.value = null
    role.value = null
    vipExpiryDate.value = null
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_role')
    localStorage.removeItem('vip_expiry')
  }

  return {
    token,
    userId,
    userName,
    role,
    vipExpiryDate,
    isLoggedIn,
    isVip,
    isAdmin,
    isAuthor,
    isCensor,
    isStaff,
    login,
    register,
    logout,
  }
})

function decodeUserId(jwtToken: string | null) {
  if (!jwtToken) {
    return null
  }

  try {
    const [, payload] = jwtToken.split('.')
    if (!payload) {
      return null
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = atob(normalizedPayload)
    const parsedPayload = JSON.parse(decodedPayload) as { sub?: string }
    const parsedUserId = Number(parsedPayload.sub)
    return Number.isFinite(parsedUserId) ? parsedUserId : null
  } catch {
    return null
  }
}
