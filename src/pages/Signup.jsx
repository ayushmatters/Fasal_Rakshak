import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'

const Signup = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await signup(form)
      // Signup now initiates OTP flow: server returns { ok: true, userId, message }
      // Only proceed if backend confirms email was sent successfully
      if (res && res.data && res.data.ok === true && res.data.userId) {
        // Temporarily save userId/email for verification
        sessionStorage.setItem('pending_userId', res.data.userId)
        sessionStorage.setItem('pending_email', form.email)
        navigate('/verify-otp')
      } else {
        // Backend returned error or incomplete response
        setError(res?.data?.message || res?.data?.reason || 'Failed to send OTP. Please try again.')
      }
    } catch (err) {
      // Network or other error
      const errorMsg = err.response?.data?.message || err.response?.data?.reason || err.message || 'Signup failed. Please try again.'
      // If it's a plain network/CORS error, append a short hint so user/developer can act
      const hint = (!err.response) ? ' (network/CORS/timeout: check server logs and CORS settings)' : ''
      setError(`${errorMsg}${hint}`)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto p-6 card mt-8">
      <h2 className="text-xl font-semibold mb-4">Create an account</h2>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Full name</label>
          <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" required />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className="form-control" required minLength={6} />
        </div>
        <div>
          <button className="btn btn--primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Sign Up'}</button>
        </div>
      </form>
    </div>
  )
}

export default Signup
