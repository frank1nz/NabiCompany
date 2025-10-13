import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'


/**
 * ใช้สำหรับหน้า user ที่ต้องผ่านการ verify ก่อน (เช่น หน้า Orders)
 */
export default function RequireVerified({ children }) {
  const { user, loading } = useAuth()
  const token = localStorage.getItem('token')
  if (loading) return null
  if (!token || !user) return <Navigate to="/" replace />
  const verified =
    user?.isVerified === true ||
    user?.verified === true ||
    user?.kycStatus === 'approved' ||
    user?.canOrderViaLine === true
  if (!verified) return <Navigate to="/" replace />
  return children
}
