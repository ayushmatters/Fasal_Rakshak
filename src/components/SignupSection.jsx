import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { register as registerUser } from '../api/endpoints'
import { useNavigate } from 'react-router-dom'

const SignupSection = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const [serverError, setServerError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const payload = { name: data.name, email: data.email, password: data.password, phone: data.phone }
      const res = await registerUser(payload)
      if (res && res.data && res.data.token) {
        localStorage.setItem('token', res.data.token)
        // store minimal user info
        localStorage.setItem('user', JSON.stringify(res.data.user || { name: data.name, email: data.email }))
        // navigate to dashboard (or show success)
        navigate('/dashboard')
      } else {
        setServerError('Registration failed. Please try again.')
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || err.message || 'Registration error')
    }
  }

  const password = watch('password', '')

  return (
    <section className="card max-w-2xl mx-auto p-6 mt-10">
      <h3 className="text-xl font-semibold text-primary mb-3">Create your account</h3>
      <p className="text-sm text-muted mb-4">Sign up to save scans, access personalized recommendations and join the community.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-row">
          <label className="form-label">Full name</label>
          <input type="text" {...register('name', { required: 'Name is required' })} className="form-control" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div className="form-row">
          <label className="form-label">Email</label>
          <input type="email" {...register('email', { required: 'Email is required' })} className="form-control" />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div className="form-row">
          <label className="form-label">Phone (optional)</label>
          <input type="tel" {...register('phone')} className="form-control" />
        </div>

        <div className="form-row">
          <label className="form-label">Password</label>
          <input type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} className="form-control" />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        <div className="form-row">
          <label className="form-label">Confirm Password</label>
          <input type="password" {...register('passwordConfirm', { required: 'Please confirm', validate: (val) => val === password || 'Passwords do not match' })} className="form-control" />
          {errors.passwordConfirm && <p className="text-xs text-red-600 mt-1">{errors.passwordConfirm.message}</p>}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="pt-2">
          <button type="submit" disabled={isSubmitting} className="btn btn--primary">
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default SignupSection
