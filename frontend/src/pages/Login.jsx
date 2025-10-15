// src/pages/Login.jsx
import { useState, useRef } from 'react';
import {
  Box, Container, Paper, Stack, TextField, Button, Typography,
  Alert, IconButton, InputAdornment, Link as MuiLink, Divider
} from '@mui/material';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { login } from '../lib/auth';
import { useAuth } from '../store/authStore';

const BRAND = { gold: '#D4AF37' };

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const alertRef = useRef(null);

  const { setToken, setUser, fetchMe } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const fromQuery = search.get('from');

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const pwOk = password.length >= 6;
  const canSubmit = emailOk && pwOk && !loading;

  async function onSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const data = await login({ email: email.trim(), password }); // trim email
      setToken?.(data.token);
      if (data.user) setUser?.(data.user);

      // ตรวจสอบ me อีกครั้ง; ถ้า fail แปลว่า token ใช้ไม่ได้
      const me = (await fetchMe?.().catch(() => {
        localStorage.removeItem('token');
        throw new Error('ไม่สามารถตรวจสอบตัวตนได้ โปรดลองอีกครั้ง');
      })) || data.user;

      const fromState = location.state?.from?.pathname;
      const from = fromState || fromQuery;
      const role = String(me?.role || '').toLowerCase();

      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/kyc', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'เข้าสู่ระบบไม่สำเร็จ');
      // โฟกัสไปที่แถบ error เพื่อการเข้าถึง
      setTimeout(() => alertRef.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'grid',
        placeItems: 'center',
        py: { xs: 4, md: 6 },
        px: 2,
        background:
          'radial-gradient(1200px 600px at 20% -10%, rgba(36,56,79,.06), transparent 40%), radial-gradient(1000px 500px at 120% 110%, rgba(212,175,55,.08), transparent 45%)',
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <Paper
          component="form"
          onSubmit={onSubmit}
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,.06)',
            boxShadow: '0 12px 28px rgba(0,0,0,.06)',
            bgcolor: '#fff',
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5" fontWeight={900}>เข้าสู่ระบบ</Typography>
              <Typography variant="body2" color="text.secondary">
                ยินดีต้อนรับกลับ — เข้าสู่ระบบเพื่อสั่งซื้อและติดตามคำสั่งซื้อ
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" tabIndex={-1} ref={alertRef}>
                {error}
              </Alert>
            )}

            <TextField
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={!!email && !emailOk}
              helperText={email && !emailOk ? 'รูปแบบอีเมลไม่ถูกต้อง' : ' '}
              autoComplete="email"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="รหัสผ่าน"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={!!password && !pwOk}
              helperText={password && !pwOk ? 'อย่างน้อย 6 ตัวอักษร' : ' '}
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((s) => !s)}
                      edge="end"
                      aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit}
              sx={{
                py: 1.2,
                fontWeight: 900,
                bgcolor: BRAND.gold,
                color: '#111',
                '&:hover': { bgcolor: '#C6A132' },
              }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
            </Button>

            <Divider flexItem />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <MuiLink component={Link} to="/forgot-password" underline="hover">
                ลืมรหัสผ่าน?
              </MuiLink>
              <Typography variant="body2" color="text.secondary">
                ยังไม่มีบัญชี?{' '}
                <MuiLink component={Link} to="/register" underline="hover" sx={{ color: BRAND.gold, fontWeight: 800 }}>
                  สมัครสมาชิก
                </MuiLink>
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
