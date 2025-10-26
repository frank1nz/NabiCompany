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


const BRAND = { gold: '#D4AF37', blue1: '#5DB3FF', blue2: '#257CFF' };

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
      <Container maxWidth="md" disableGutters>
        {/* Card สองฝั่ง */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,.06)',
            boxShadow: '0 16px 40px rgba(0,0,0,.08)',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
          }}
        >
          {/* แผงซ้าย: พื้นหลังไล่เฉด + โลโก้ */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              p: 4,
              background: `linear-gradient(180deg, ${BRAND.blue1} 0%, ${BRAND.blue2} 100%)`,
            }}
          >
            {/* คลื่นบาง ๆ */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(65% 80% at 30% 20%, rgba(255,255,255,.25) 0%, rgba(255,255,255,0) 60%), radial-gradient(70% 90% at 80% 0%, rgba(255,255,255,.18) 0%, rgba(255,255,255,0) 55%)',
              }}
            />
            <Stack alignItems="center" zIndex={1} spacing={2}>
              {/* โลโก้ / อักษรย่อ */}
              <Box
                sx={{
                  width: 72, height: 72, borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,.2)',
                  display: 'grid', placeItems: 'center',
                  backdropFilter: 'blur(2px)',
                }}
              >
                <Typography variant="h4" fontWeight={900} color="#fff">🍾</Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color="#fff" letterSpacing={1}>
                NABI SPIRITS
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,.85)" textAlign="center" sx={{ maxWidth: 280 }}>
                ทุกหยดที่รินออกจากขวด คือรสชาติของแผ่นดินไทย กลิ่นหอมของข้าวและผลไม้ท้องถิ่น ที่ผสมผสานด้วยหัวใจของผู้คนในชุมชน
              </Typography>
            </Stack>
          </Box>

          {/* ฝั่งขวา: ฟอร์ม */}
          <Box component="form" onSubmit={onSubmit} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#fff' }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h4" fontWeight={900} color="#2B4A73" sx={{ mb: 0.5 }}>
                  Welcome
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Login in to your account to continue
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" tabIndex={-1} ref={alertRef}>
                  {error}
                </Alert>
              )}

              
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={!!email && !emailOk}
                helperText={email && !emailOk ? 'รูปแบบอีเมลไม่ถูกต้อง' : ' '}
                autoComplete="email"
                disabled={loading}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 999,
                    bgcolor: '#EAF3FF',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'transparent' },
                    '&.Mui-focused fieldset': { borderColor: BRAND.blue2 },
                    px: 1,
                  },
                }}
              />

              <TextField
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={!!password && !pwOk}
                helperText={password && !pwOk ? 'อย่างน้อย 6 ตัวอักษร' : ' '}
                autoComplete="current-password"
                disabled={loading}
                fullWidth
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 999,
                    bgcolor: '#EAF3FF',
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'transparent' },
                    '&.Mui-focused fieldset': { borderColor: BRAND.blue2 },
                    px: 1,
                  },
                }}
              />

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: -1 }}>
                <MuiLink component={Link} to="/forgot-password" underline="hover" color="text.secondary">
                  forgot your password?
                </MuiLink>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
                fullWidth
                sx={{
                  py: 1.2,
                  fontWeight: 900,
                  borderRadius: 999,
                  textTransform: 'none',
                  width: 200,
                  alignSelf: 'center',
                  bgcolor: '#2F7BFF',
                  boxShadow: '0 8px 16px rgba(47,123,255,.25)',
                  '&:hover': { bgcolor: '#1F6BEE' },
                }}
              >
                {loading ? 'กำลังเข้าสู่ระบบ…' : 'LOG IN'}
              </Button>

              <Divider flexItem sx={{ my: 1 }} />

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Don’t have an account?{' '}
                <MuiLink component={Link} to="/register" underline="hover" sx={{ fontWeight: 800 }}>
                  Sign Up
                </MuiLink>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}