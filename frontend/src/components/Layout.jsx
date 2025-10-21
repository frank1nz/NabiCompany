import { useEffect } from 'react';
import { Container, CircularProgress, Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../store/authStore';

const BRAND = { navy: '#1C2738', gold: '#D4AF37' };

export default function Layout() {
  const { fetchMe, loading, user } = useAuth();
  const location = useLocation();

  // 🧠 โหลดข้อมูลผู้ใช้ถ้ามี token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      fetchMe();
    }
  }, [fetchMe, user]);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  // ⏳ Loading screen
  if (loading && !user && localStorage.getItem('token')) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'rgba(250,250,250,0.8)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isAuthPage
          ? 'linear-gradient(180deg, #fdfdfd, #fafafa)'
          : 'linear-gradient(180deg, #ffffff, #f9f9f9)',
      }}
    >
      {/* 🌟 Navbar */}
      <Navbar />

      {/* 🧩 Content Container */}
      <Container
        maxWidth="lg"
        sx={{
        maxWidth: isAuthPage ? 'md' : 'lg',
        py: isAuthPage ? { xs: 6, md: 8 } : { xs: 4, md: 6 },
        px: { xs: 2, md: isAuthPage ? 4 : 3 },
        minHeight: isAuthPage ? 'calc(100vh - 200px)' : 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        animation: 'fadeIn 0.5s ease-in-out',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
      >
        <Outlet />
      </Container>

      {/* 🌈 Footer (optional เพิ่มได้ภายหลัง) */}
      <Box
        sx={{
          mt: 'auto',
          textAlign: 'center',
          py: 3,
          color: '#777',
          fontSize: 13,
          borderTop: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        © {new Date().getFullYear()} NABI Spirits — Crafted in Thailand with Passion
      </Box>
    </Box>
  );
}
