import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5174',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers = config.headers || {}, config.headers.Authorization = `Bearer ${token}`
  return config
})

if (import.meta.env.DEV) {
  import('./mockServer')
}

export default api
