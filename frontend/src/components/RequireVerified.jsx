import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'


/**
* ใช้สำหรับหน้า user ที่ต้องผ่านการ verify ก่อน (เช่น /lead)
*/
export default function RequireVerified({ children }) {
const { user, loading } = useAuth()
const token = localStorage.getItem('token')
if (loading) return null
if (!token || !user) return <Navigate to="/login" replace />
// รองรับได้ทั้ง user.verified === true หรือ kycStatus === 'approved'
const verified = user?.verified === true || user?.kycStatus === 'approved'
if (!verified) return <Navigate to="/status" replace />
return children
}