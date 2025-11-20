import api from './apiClient'

// Auth
export const signup = (body) => api.post('/api/auth/signup', body)
export const login = (body) => api.post('/api/auth/login', body)
export const verifyOtp = (body) => api.post('/api/auth/verify-otp', body)
export const resendOtp = (body) => api.post('/api/auth/resend-otp', body)
export const getMe = () => api.get('/api/auth/me')

// Scan upload & results
export const uploadScanImage = (file) => {
  const fd = new FormData()
  fd.append('image', file)
  return api.post('/api/scan/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const getScanResult = (scanId) => api.get(`/api/scan/${scanId}`)
export const startScanProcessing = (scanId) => api.post(`/api/scan/process/${scanId}`)

// Community
export const getCommunityPosts = () => api.get('/api/community')
export const createPost = (body) => api.post('/api/community', body)

// Products
export const getProducts = () => api.get('/api/products')
export const createProduct = (body) => api.post('/api/products', body)

// Auth logout
export const logout = () => api.post('/api/auth/logout')

// Misc (legacy or frontend-only endpoints should be added here as needed)
