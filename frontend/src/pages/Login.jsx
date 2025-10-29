// src/pages/Login.jsx
import { useState, useRef } from 'react';
import {
  Box, Container, Paper, Stack, TextField, Button, Typography,
  Alert, IconButton, InputAdornment, Link as MuiLink, Divider, useTheme
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { login } from '../lib/auth';
import { useAuth } from '../store/authStore';
import logo from '../assets/nabi_logo_no_bg.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const alertRef = useRef(null);

  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;
  const primaryMain = theme.palette.primary.main;
  const primaryLight = brand?.blue1 || theme.palette.primary.light;
  const primaryGradient = brand?.blue2 || primaryMain;
  const fieldBg = alpha(primaryLight, 0.18);

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
      const data = await login({ email: email.trim(), password });
      setToken?.(data.token);
      if (data.user) setUser?.(data.user);

      const me = (await fetchMe?.().catch(() => {
        localStorage.removeItem('token');
        throw new Error('ไม่สามารถตรวจสอบตัวตนได้ โปรดลองอีกครั้ง');
      })) || data.user;

      const fromState = location.state?.from?.pathname;
      const from = fromState || fromQuery;
      const role = String(me?.role || '').toLowerCase();

      if (from) navigate(from, { replace: true });
      else if (role === 'admin') navigate('/admin/kyc', { replace: true });
      else navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'เข้าสู่ระบบไม่สำเร็จ');
      setTimeout(() => alertRef.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(70vh - 64px)',
        display: 'grid',
        placeItems: 'center',
        py: { xs: 1, md: 0 },
        px: 2,

      }}
    >
      <Container maxWidth="md" disableGutters>
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
          {/* ฝั่งซ้าย: โลโก้ + สโลแกน */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: `linear-gradient(180deg, ${primaryLight} 0%, ${primaryGradient} 100%)`,
              color: '#fff',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(65% 80% at 30% 20%, rgba(255,255,255,.25) 0%, rgba(255,255,255,0) 60%), radial-gradient(70% 90% at 80% 0%, rgba(255,255,255,.18) 0%, rgba(255,255,255,0) 55%)',
              }}
            />
            <Stack alignItems="center" spacing={2} zIndex={1}>
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,.25)',
                  display: 'grid',
                  placeItems: 'center',
                  backdropFilter: 'blur(2px)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={logo}
                  alt="Nabi Spirits Logo"
                  style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="h6" fontWeight={800}>
                NABI SPIRITS
              </Typography>
              <Typography
                variant="caption"
                color="rgba(255,255,255,.9)"
                textAlign="center"
                sx={{ maxWidth: 260 }}
              >
                ทุกหยดที่รินออกจากขวด คือรสชาติของแผ่นดินไทย  
                กลิ่นหอมของข้าวและผลไม้ท้องถิ่น ที่ผสมผสานด้วยหัวใจของผู้คนในชุมชน
              </Typography>
            </Stack>
          </Box>

          {/* ฝั่งขวา: ฟอร์ม Login */}
          <Box component="form" onSubmit={onSubmit} sx={{ p: { xs: 3, md: 5 }, bgcolor: '#fff' }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  color={brand?.navy || theme.palette.text.primary}
                >
                  Welcome
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ยินดีต้อนรับเข้าสู่โลกแห่งจินตนาการ
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" tabIndex={-1} ref={alertRef}>
                  {error}
                </Alert>
              )}

              {/* Email */}
              <TextField
                label="อีเมล"
                type="email"
                placeholder='อีเมลของคุณ'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={!!email && !emailOk}
                helperText={email && !emailOk ? 'Invalid email format' : ' '}
                autoComplete="email"
                disabled={loading}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    bgcolor: fieldBg,
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'transparent' },
                    '&.Mui-focused fieldset': { borderColor: primaryMain },
                    px: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Password */}
              <TextField
                label="รหัสผ่าน"
                placeholder='รหัสผ่านของคุณ'
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={!!password && !pwOk}
                helperText={password && !pwOk ? 'Minimum 6 characters' : ' '}
                autoComplete="current-password"
                disabled={loading}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    bgcolor: fieldBg,
                    '& fieldset': { borderColor: 'transparent' },
                    '&:hover fieldset': { borderColor: 'transparent' },
                    '&.Mui-focused fieldset': { borderColor: primaryMain },
                    px: 1,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" style={{paddingRight:10}}>
                      <IconButton onClick={() => setShowPw((s) => !s)} edge="end">
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* ลิงก์ Forgot */}
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: -1 }}>
                <MuiLink component={Link} to="/forgot-password" underline="hover" color="text.secondary">
                  ลืมรหัสผ่าน ?
                </MuiLink>
              </Stack>

              {/* ปุ่ม Login */}
              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
                sx={{
                  py: 1.2,
                  fontWeight: 900,
                  borderRadius: 999,
                  textTransform: 'none',
                  width: 200,
                  alignSelf: 'center',
                  bgcolor: primaryMain,
                  boxShadow: `0 8px 16px ${alpha(primaryMain, 0.25)}`,
                  '&:hover': { bgcolor: darken(primaryMain, 0.08) },
                }}
              >
                {loading ? 'Logging in…' : 'LOG IN'}
              </Button>

              <Divider flexItem sx={{ my: 1 }} />

              <Typography variant="body2" color="text.secondary" textAlign="center">
                ไม่มีบัญชี?{' '}
                <MuiLink
                  component={Link}
                  to="/register"
                  underline="hover"
                  sx={{ fontWeight: 800, color: accent }}
                >
                  สมัครสมาชิก
                </MuiLink>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
