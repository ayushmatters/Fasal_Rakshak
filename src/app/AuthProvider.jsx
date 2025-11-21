import React, { createContext, useContext, useEffect, useState } from 'react'
import { signup as apiSignup, login as apiLogin, getMe as apiGetMe, logout as apiLogout } from '../api/endpoints'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const normalizeUser = (u = {}) => {
    const src = u || {}
    return {
      id: (src.id || src._id) ? String(src.id || src._id) : null,
      name: src?.name ? String(src.name) : '',
      email: src?.email ? String(src.email) : '',
      role: (String(src?.role || '')).toUpperCase() || 'FARMER'
    }
  }

  // Try to load user from token on mount
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await apiGetMe()
        const u = res?.data?.user || res?.data || {}
        setUser(normalizeUser(u))
      } catch (err) {
        console.warn('Failed to fetch profile during init', err.message || err)
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // NOTE: signup now initiates OTP flow. Server responds with { message, userId }
  // Client should not set token until verification completes.
  const signup = async ({ name, email, password }) => {
    const res = await apiSignup({ name, email, password })
    return res
  }

  const login = async ({ email, password }) => {
    const res = await apiLogin({ email, password })
    // If server returns 403 (not verified), propagate message so UI can show resend option
    if (res?.data?.token) {
      localStorage.setItem('token', res.data.token)
      const u = res?.data?.user || {}
        if (import.meta.env?.DEV) {
          try { console.debug('[AuthProvider] login user payload:', u) } catch (e) {}
        }
      // normalize user object: ensure all fields are defined strings before operations
      const normalizedUser = {
        id: (u.id || u._id) ? String(u.id || u._id) : null,
        name: u?.name ? String(u.name) : '',
        email: u?.email ? String(u.email) : '',
        role: (String(u?.role || '')).toUpperCase() || 'FARMER'
      }
      setUser(normalizedUser)
    }
    return res
  }

  // Verify OTP and finalize signup: server returns token + user
  const verifyOtp = async ({ userId, email, otp }) => {
    try {
      // Guard: ensure OTP is a valid string
      if (!otp || (typeof otp !== 'string' && typeof otp !== 'number')) {
        return { error: true, message: 'OTP must be a valid string or number' }
      }

      const res = await (await import('../api/endpoints')).verifyOtp({ userId, email, otp })
      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token)
        // normalize user object to avoid runtime errors in UI
        // Ensure all fields are defined and are strings before operations
        const u = res?.data?.user || {}
        if (import.meta.env?.DEV) {
          try { console.debug('[AuthProvider] verify user payload:', u) } catch (e) {}
        }
        const normalizedUser = {
          id: (u.id || u._id) ? String(u.id || u._id) : null,
          name: u?.name ? String(u.name) : '',
          email: u?.email ? String(u.email) : '',
          role: (String(u?.role || '')).toUpperCase() || 'FARMER'
        }
        setUser(normalizedUser)
      }
      return res
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Verification failed'
      try { console.error('[AuthProvider] verifyOtp error:', msg) } catch (e) {}
      throw new Error(msg)
    }
  }

  const resendOtp = async ({ userId, email }) => {
    const res = await (await import('../api/endpoints')).resendOtp({ userId, email })
    return res
  }

  const logout = () => {
    try {
      apiLogout().catch(() => {})
    } catch (e) {}
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, verifyOtp, resendOtp }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
