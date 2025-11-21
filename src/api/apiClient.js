import axios from 'axios'

const resolveBaseUrl = () => {
  // Prefer Vite's import.meta.env in the browser. Access it dynamically
  // to avoid static parsing issues in Node/Jest.
  try {
    const viteMeta = new Function('return import.meta')()
    if (viteMeta && viteMeta.env && viteMeta.env.VITE_API_URL) return viteMeta.env.VITE_API_URL
  } catch (e) {
    // Not running in an environment with import.meta (e.g. Jest/Node)
  }

  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
    return process.env.VITE_API_URL
  }

  return 'http://localhost:5000'
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fasal_token') || localStorage.getItem('token')
  if (token) config.headers = config.headers || {}, config.headers.Authorization = `Bearer ${token}`
  // Helpful debug: which baseURL is being used (visible in dev console/network logs)
  try { console.debug('[apiClient] baseURL=', api.defaults.baseURL) } catch (e) {}
  return config
})

// Log response errors to make "Network Error" root causes visible in dev
api.interceptors.response.use(
  (res) => res,
  (err) => {
    try {
      console.error('[apiClient] Response error:', err.message)
      if (err.config) console.error('[apiClient] Request url:', err.config.url, 'method:', err.config.method)
      if (err.response) console.error('[apiClient] Response status:', err.response.status, 'data:', err.response.data)
      else console.error('[apiClient] No response received (network/CORS/timeout)')
    } catch (e) {}
    return Promise.reject(err)
  }
)

try {
  const viteMeta = new Function('return import.meta')()
  if (viteMeta && viteMeta.env && viteMeta.env.DEV) {
    import('./mockServer')
  }
} catch (e) {
  // not running in Vite (e.g. Jest)
}

export default api
