import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'


export default function RequireAuth({ roles = ['user','admin'], children }) {
const { user, loading } = useAuth()
const token = localStorage.getItem('token')
if (loading) return null
if (!token) return <Navigate to="/" replace />
if (!user) return <Navigate to="/" replace />
if (!roles.includes(user.role)) return <Navigate to="/" replace />
return children
}
