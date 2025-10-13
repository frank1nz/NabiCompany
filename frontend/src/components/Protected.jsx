import { Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../store/authStore'


export default function Protected() {
const { user, loading, fetchMe } = useAuth()


useEffect(() => { fetchMe() }, [])


if (loading) return null
const token = localStorage.getItem('token')
if (!token) return <Navigate to="/login" replace />
if (!user) return <Navigate to="/login" replace />
return <Outlet />
}