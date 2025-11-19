import api from './apiClient'

export const sendOtp = (phone) => api.post('/auth/send-otp', { phone })
export const verifyOtp = (phone, otp) => api.post('/auth/verify', { phone, otp })
export const uploadScanImage = (file) => {
  const fd = new FormData()
  fd.append('image', file)
  return api.post('/scan/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const getScanResult = (scanId) => api.get(`/scan/result/${scanId}`)
export const getHeatmap = () => api.get('/heatmap')
export const getCommunityPosts = () => api.get('/community/posts')
export const createPost = (body) => api.post('/community/posts', body)
export const getProducts = () => api.get('/products')
export const checkout = (cart) => api.post('/checkout', { cart })
