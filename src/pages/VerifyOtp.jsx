import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'

const VerifyOtp = () => {
  const { verifyOtp, resendOtp } = useAuth()
  const [params] = useSearchParams()
  const emailParam = params.get('email')
  const [userId, setUserId] = useState(null)
  const [email, setEmail] = useState(emailParam || '')
  useEffect(() => {
    // Load pending user info from sessionStorage if present
    const pendingId = sessionStorage.getItem('pending_userId')
    const pendingEmail = sessionStorage.getItem('pending_email')
    if (pendingId) setUserId(pendingId)
    if (pendingEmail) setEmail(pendingEmail)
  }, [])
  const [otp, setOtp] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const inputRef = useRef()
  const navigate = useNavigate()

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const body = { otp, userId, email }
      const res = await verifyOtp(body)
      if (res && res.data && res.data.token) {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed')
      // simple anti-brute UI block
      setResendDisabled(true)
      setTimeout(() => setResendDisabled(false), 2000)
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setError(null)
    setResendDisabled(true)
    try {
      const res = await resendOtp({ userId, email })
      setResendCount((c) => c + 1)
      setTimeout(() => setResendDisabled(false), 30000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Resend failed')
      setResendDisabled(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 card mt-8">
      <h2 className="text-xl font-semibold mb-4">Verify your email</h2>
      {email && <div className="text-sm text-slate-600 mb-2">Verification code sent to <strong>{email}</strong></div>}
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="form-label">6-digit code</label>
          <input ref={inputRef} name="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))} className="form-control text-lg tracking-widest text-center" inputMode="numeric" autoComplete="one-time-code" required />
        </div>
        <div className="flex items-center justify-between">
          <button className="btn btn--primary" type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
          <button type="button" className="btn" onClick={handleResend} disabled={resendDisabled}>{resendDisabled ? 'Wait...' : `Resend OTP (${resendCount}/3)`}</button>
        </div>
      </form>
    </div>
  )
}

export default VerifyOtp

/*
Security notes:
- The UI accepts either userId or email (server supports both).
- The resend button is disabled for 30s after click to prevent spam.
*/
