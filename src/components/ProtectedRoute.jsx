import React, { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../app/AuthProvider'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { replace: true })
      } else {
        setShouldRender(true)
      }
    }
  }, [loading, user, navigate])

  // Show nothing while loading or if user is not authenticated
  if (loading || !user || !shouldRender) {
    return <div className="h-screen w-full"></div>
  }

  // If authenticated, show the protected content
  return children
}

export default ProtectedRoute
