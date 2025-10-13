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

  return (
    <>
      <Navbar />
      <Container sx={{ py: 3 }}>
        {loading && !user ? (
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
