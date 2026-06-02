import axios from 'axios'

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const requestUrl = config.url ?? ''
  const isAuthRequest = requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/register')
  if (isAuthRequest) {
    delete config.headers.Authorization
    return config
  }

  const token = localStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
