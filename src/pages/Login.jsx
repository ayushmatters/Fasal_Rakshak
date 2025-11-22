import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'

const Login = () => {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await login(form)
      if (res && res.data && res.data.token) {
        navigate('/dashboard')
      } else if (res && res.status === 403) {
        // Not verified
        setError('Email not verified — check your email or resend OTP')
        sessionStorage.setItem('pending_email', form.email)
        navigate('/verify-otp')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed')
    } finally { setIsLoading(false) }
  }

  // Don't render login form while loading auth state
  if (loading) {
    return <div className="h-screen w-full"></div>
  }

  return (
    <div className="max-w-md mx-auto p-6 card mt-8">
      <h2 className="text-xl font-semibold mb-4">Sign in to your account</h2>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" required />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="form-control" required />
        </div>
        <div>
          <button className="btn btn--primary" type="submit" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign In'}</button>
        </div>
      </form>
    </div>
  )
}

export default Login
