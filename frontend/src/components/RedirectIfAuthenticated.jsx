import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export default function RedirectIfAuthenticated({ children }) {
  const { user, loading, fetchMe } = useAuth()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (token && !user) {
      fetchMe()
    }
  }, [token, user, fetchMe])

  if (loading) return null
  if (token && user) return <Navigate to="/" replace />
  return children
}
