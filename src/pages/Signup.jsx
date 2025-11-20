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
      if (res && res.data && res.data.token) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed')
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
