import api from './apiClient'

const wait = (min = 300, max = 900) => new Promise((r) => setTimeout(r, Math.random() * (max - min) + min))

const db = { posts: [], products: [], scans: {}, users: [] }

const fakeScanResult = (id) => ({
  scanId: id,
  disease: 'Leaf Blight',
  confidence: 0.87,
  recommendations: ['Apply fungicide', 'Remove infected leaves'],
  timestamp: Date.now(),
  status: 'done'
})

api.interceptors.request.use(async (config) => {
  // only mock our app's calls
  await wait()
  const { url, method, data } = config
  if (!url) return config
  if (url.includes('/auth/send-otp') && method === 'post') {
    return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }
  }
  if (url.includes('/auth/verify') && method === 'post') {
    const token = 'mock-token'
    return { data: { token }, status: 200, statusText: 'OK', headers: {}, config }
  }
  if (url.includes('/scan/upload') && method === 'post') {
    const id = `scan_${Math.random().toString(36).slice(2,9)}`
    db.scans[id] = { ...fakeScanResult(id), status: 'processing' }
    setTimeout(() => { db.scans[id].status = 'done' }, 1200)
    return { data: { scanId: id }, status: 200, statusText: 'OK', headers: {}, config }
  }
  if (url.match(/\/scan\/result\//) && method === 'get') {
    const id = url.split('/').pop()
    const rec = db.scans[id]
    if (!rec) return { data: { error: 'not found' }, status: 404, statusText: 'Not Found', headers: {}, config }
    return { data: rec, status: 200, statusText: 'OK', headers: {}, config }
  }
  if (url.includes('/community/posts') && method === 'get') {
    return { data: db.posts, status: 200, statusText: 'OK', headers: {}, config }
  }
  if (url.includes('/community/posts') && method === 'post') {
    const body = typeof data === 'string' ? JSON.parse(data) : data
    const post = { id: `p_${Date.now()}`, author: 'You', text: body.text }
    db.posts.unshift(post)
    return { data: post, status: 201, statusText: 'Created', headers: {}, config }
  }
  if (url.includes('/heatmap') && method === 'get') {
    return { data: { points: [ { lat: 26.9, lng: 75.8, intensity: 0.8 } ] }, status: 200, statusText: 'OK', headers: {}, config }
  }
  if (url.includes('/products') && method === 'get') {
    return { data: db.products.length ? db.products : [{ id: 'prd1', name: 'Fertilizer A', price: 499 }], status: 200, statusText: 'OK', headers: {}, config }
  }
  if (url.includes('/checkout') && method === 'post') {
    return { data: { ok: true, orderId: `ord_${Date.now()}` }, status: 200, statusText: 'OK', headers: {}, config }
  }

  return config
})

export default function initMock() { return true }
