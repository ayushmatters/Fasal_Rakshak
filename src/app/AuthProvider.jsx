import React, { createContext, useContext, useEffect, useState } from 'react'
import { signup as apiSignup, login as apiLogin, getMe as apiGetMe, logout as apiLogout } from '../api/endpoints'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
        setUser(res.data)
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

  const signup = async ({ name, email, password }) => {
    const res = await apiSignup({ name, email, password })
    if (res && res.data && res.data.token) {
      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
    }
    return res
  }

  const login = async ({ email, password }) => {
    const res = await apiLogin({ email, password })
    if (res && res.data && res.data.token) {
      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
    }
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
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
