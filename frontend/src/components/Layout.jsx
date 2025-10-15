// src/components/Layout.jsx
import { useEffect } from 'react'
import { Container, CircularProgress, Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../store/authStore'

export default function Layout() {
  const { fetchMe, loading, user } = useAuth()

  useEffect(() => {
    if (localStorage.getItem('token') && !user) {
      fetchMe()
    }
  }, [fetchMe, user])

  // ถ้ามี token และกำลังดึงข้อมูล me ให้ขึ้น loading สั้น ๆ (ไม่ต้องซ่อน Navbar)
  const showBlockingLoader = loading && !user && localStorage.getItem('token')

  return (
    <>
      <Navbar />  {/* ✅ แสดงทุกหน้า รวม login/register */}
      <Container sx={{ py: 3 }}>
        {showBlockingLoader ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Outlet />
        )}
      </Container>
    </>
  )
}
