import { useMemo, useState } from 'react';
import {
  Container, Paper, Stack, Grid, TextField, Typography, Alert, Button,
  InputLabel, Link as MuiLink, IconButton, InputAdornment, Checkbox,
  FormControlLabel, Box, Divider, useTheme,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhoneIphoneOutlined from '@mui/icons-material/PhoneIphoneOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../lib/auth';
import logo from '../assets/nabi_logo_no_bg.png';
const MAX_IMG_MB = 5;
const ACCEPT = 'image/jpeg,image/png,image/webp';

const initialState = {
  name: '', email: '', password: '', dob: '',
  phone: '', lineId: '', facebookProfileUrl: '', address: '',
  idCardImage: null, selfieWithId: null, agree: false,
};

function calcAge(dob) {
  if (!dob) return 0;
  const d = new Date(dob); const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}

export default function Register() {
  const [form, setForm] = useState(initialState);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;
  const primaryMain = theme.palette.primary.main;
  const primaryLight = brand?.blue1 || theme.palette.primary.light;
  const primaryGradient = brand?.blue2 || primaryMain;
  const fieldBg = alpha(primaryLight, 0.18);
  const textareaBg = alpha(primaryMain, 0.08);
  const uploadBg = theme.palette.background.paper;

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const previews = useMemo(
    () => ({
      idCard: form.idCardImage ? URL.createObjectURL(form.idCardImage) : '',
      selfie: form.selfieWithId ? URL.createObjectURL(form.selfieWithId) : '',
    }),
    [form.idCardImage, form.selfieWithId]
  );

  const emailOk = /\S+@\S+\.\S+/.test(form.email);
  const pwOk = form.password.length >= 6;
  const age = calcAge(form.dob);
  const ageOk = age >= 20;
  const phoneOk = !form.phone || /^[0-9+\-()\s]{6,}$/.test(form.phone);
  const idOk = !!form.idCardImage;
  const selfieOk = !!form.selfieWithId;
  const agreeOk = form.agree === true;

  const canSubmit =
    form.name && form.address && emailOk && pwOk && ageOk && phoneOk &&
    idOk && selfieOk && agreeOk && !loading;

  function handleFile(field) {
    return (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (!ACCEPT.split(',').includes(f.type)) {
        setError('อัปโหลดได้เฉพาะ JPG/PNG/WebP'); return;
      }
      if (f.size > MAX_IMG_MB * 1024 * 1024) {
        setError(`ไฟล์เกิน ${MAX_IMG_MB}MB`); return;
      }
      setError(''); setField(field, f);
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries({
        name: form.name, email: form.email, password: form.password,
        dob: form.dob, phone: form.phone, lineId: form.lineId,
        facebookProfileUrl: form.facebookProfileUrl, address: form.address,
      }).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (form.idCardImage) fd.append('idCardImage', form.idCardImage);
      if (form.selfieWithId) fd.append('selfieWithId', form.selfieWithId);
      await register(fd);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally { setLoading(false); }
  }

  // ===== ปรับค่าความมนและการตั้งค่าช่อง Address =====
  const RADIUS = 1; // ลดความมนทุกช่อง
  const ADDRESS = {
    colsMd: 12,      // 6 = ครึ่งแถว, 12 = เต็มแถว
    width: 650,      // ความกว้างช่องที่อยู่ (px)
    minRows: 6,      // ความสูงเริ่มต้น (บรรทัด)
  };

  const inputCapsuleSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: RADIUS,
      bgcolor: fieldBg,
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: 'transparent' },
      '&.Mui-focused fieldset': { borderColor: primaryMain },
      px: 1,
    },
  };

  const bigFieldSx = {
    ...inputCapsuleSx,
    '& .MuiInputLabel-root': {
      fontSize: 16,
    },
    '& .MuiOutlinedInput-root': {
      ...inputCapsuleSx['& .MuiOutlinedInput-root'],
      minHeight: 60,
      px: 1.25,
    },
    '& .MuiInputBase-input': {
      fontSize: 16,
      lineHeight: 1.6,
      py: 1.05,
    },
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(80vh - 64px)',
        display: 'grid',
        placeItems: 'center',
        py: { xs: 3, md: 0},
        px: 0,
      
      }}
    >
      <Container maxWidth="md" disableGutters>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,.05)',
            boxShadow: '0 8px 24px rgba(0,0,0,.06)',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'clamp(140px,18vw,180px) 1fr' },
          }}
        >
          {/* ฝั่งซ้าย */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              p: 1,
              background: `linear-gradient(180deg, ${primaryLight} 0%, ${primaryGradient} 100%)`,
              color: '#fff',
            }}
          >
            <Stack alignItems="center" spacing={1.5} zIndex={1}>
              <Box
                sx={{
                  width: 65, height: 65, borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,.2)',
                  display: 'grid', placeItems: 'center',
                  backdropFilter: 'blur(2px)', overflow: 'hidden',
                }}
              >
                <img src={logo} alt="Nabi Spirits Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} letterSpacing={1}>
                NABI SPIRITS
              </Typography>
            </Stack>
          </Box>

          {/* ฝั่งขวา */}
          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              p: { xs: 2.5, md: 4 },
              bgcolor: theme.palette.background.paper,
              maxWidth: 720,
              mx: 'auto',
              width: '100%',
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={900}
                  color={brand?.navy || theme.palette.text.primary}
                  sx={{ mb: 0.25 }}
                >
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  สมัครสมาชิกและยืนยันตัวตนเพื่อสั่งซื้อและติดตามคำสั่งซื้อ
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              {/* ===== ฟอร์ม: 2 ช่องต่อแถว ===== */}
              <Grid container columns={12} columnSpacing={4} rowSpacing={1.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="ชื่อ-นามสกุล"
                    value={form.name}
                    placeholder='ชื่อของคุณ'
                    onChange={(e) => setField('name', e.target.value)}
                    required fullWidth size="medium"
                    sx={bigFieldSx}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlined /></InputAdornment>) }}
                  />
             
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="วันเดือนปีเกิด" type="date" value={form.dob}
                    onChange={(e) => setField('dob', e.target.value)}
                    InputLabelProps={{ shrink: true, sx: { fontSize: 16 } }} required fullWidth
                    error={!!form.dob && !ageOk}
                    helperText={form.dob ? (ageOk ? `อายุ ${age} ปี` : 'ต้องอายุอย่างน้อย 20 ปี') : ' '}
                    size="medium" sx={bigFieldSx}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarMonthOutlined /></InputAdornment>) }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="อีเมล" type="email" value={form.email}
                    placeholder='อีเมลของคุณ'
                    onChange={(e) => setField('email', e.target.value)}
                    required fullWidth error={!!form.email && !emailOk}
                    helperText={form.email && !emailOk ? 'รูปแบบอีเมลไม่ถูกต้อง' : ' '}
                    size="medium" sx={bigFieldSx}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlined /></InputAdornment>) }}
                  />
                </Grid>

               <Grid item xs={12} md={6}>
                    <TextField
                      label="รหัสผ่าน"
                      type={showPw ? 'text' : 'password'}
                       placeholder='รหัสผ่านของคุณ'
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      required
                      error={!!form.password && !pwOk}
                      helperText={form.password && !pwOk ? 'อย่างน้อย 6 ตัวอักษร' : ' '}
                      size="medium"
                      sx={{
                        ...bigFieldSx,                // คงสไตล์พื้นฐาน
                        width: { xs: '100%', md: 230 },
                        '& .MuiOutlinedInput-root': { // merge ของเดิมก่อนค่อยใส่ใหม่
                          ...bigFieldSx['& .MuiOutlinedInput-root'],
                          minHeight: 60,              // ← ปรับความสูงช่อง
                          bgcolor: '#EAF3FF',         // ย้ำสีพื้นหลัง (ป้องกันหาย)
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined />
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
                  </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="เบอร์โทรศัพท์" value={form.phone}
                    placeholder='เบอร์ของคุณ'
                    onChange={(e) => setField('phone', e.target.value)}
                    fullWidth error={!!form.phone && !phoneOk}
                    helperText={form.phone && !phoneOk ? 'กรุณากรอกเฉพาะตัวเลข/สัญลักษณ์ที่เกี่ยวข้อง' : ' '}
                    size="medium" sx={bigFieldSx}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIphoneOutlined /></InputAdornment>) }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="LINE ID" value={form.lineId}
                    onChange={(e) => setField('lineId', e.target.value)}
                    fullWidth size="medium" sx={bigFieldSx}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="ลิงก์ Facebook (ถ้ามี)"
                    value={form.facebookProfileUrl}
                    onChange={(e) => setField('facebookProfileUrl', e.target.value)}
                    placeholder="https://facebook.com/your.profile"
                    size="medium"
                    sx={{
                      // 1) คงสไตล์เดิมไว้ก่อน
                      ...bigFieldSx,

                      // 2) เพิ่มความกว้างเฉพาะช่องนี้
                      width: '100%',
                      maxWidth: 480,

                      // 3) เวลาแก้ส่วน .MuiOutlinedInput-root ต้อง merge ของเดิมก่อน
                      '& .MuiOutlinedInput-root': {
                        ...bigFieldSx['& .MuiOutlinedInput-root'],
                        minHeight: 70,               // ← ปรับความสูงที่นี่
                        bgcolor: '#EAF3FF',          // ← ย้ำพื้นหลังไว้ให้แน่ใจ
                        // หรือใช้ backgroundColor ก็ได้
                        // backgroundColor: '#EAF3FF',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkOutlined />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* ช่องที่อยู่: ปรับเองได้ทั้งกว้าง/ยาว */}
                <Grid item xs={12} md={ADDRESS.colsMd}>
                  <TextField
                    label="ที่อยู่สำหรับจัดส่ง"
                    value={form.address}
                    onChange={(e) => setField('address', e.target.value)}
                    required
                    multiline
                    minRows={ADDRESS.minRows}
                    placeholder="บ้านเลขที่ / อาคาร / ถนน / แขวง / เขต / จังหวัด / รหัสไปรษณีย์"
                    size="medium"
                    sx={{
                      ...bigFieldSx,
                      width: '100%',
                      maxWidth: ADDRESS.width,
                      '& .MuiOutlinedInput-root': {
                        ...bigFieldSx['& .MuiOutlinedInput-root'],
                        borderRadius: RADIUS,
                        bgcolor: textareaBg,
                      },
                      '& textarea': {
                        resize: 'both',
                        overflow: 'auto',
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" fontWeight={800}>
                เอกสารยืนยันตัวตน
              </Typography>

              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ mb: 1 }}>บัตรประชาชน (≤ {MAX_IMG_MB}MB)</InputLabel>
                  <Box sx={{ border: '1px dashed rgba(0,0,0,.25)', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: uploadBg, maxWidth: 520, mx: 'auto' }}>
                    <Button variant="outlined" startIcon={<UploadFileOutlined />} component="label">
                      เลือกไฟล์
                      <input hidden type="file" accept={ACCEPT} onChange={handleFile('idCardImage')} />
                    </Button>
                    {previews.idCard ? (
                      <img src={previews.idCard} alt="id preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">ยังไม่ได้เลือกไฟล์</Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <InputLabel sx={{ mb: 1 }}>รูปถ่ายถือบัตร (≤ {MAX_IMG_MB}MB)</InputLabel>
                  <Box sx={{ border: '1px dashed rgba(0,0,0,.25)', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: uploadBg, maxWidth: 520, mx: 'auto' }}>
                    <Button variant="outlined" startIcon={<UploadFileOutlined />} component="label">
                      เลือกไฟล์
                      <input hidden type="file" accept={ACCEPT} onChange={handleFile('selfieWithId')} />
                    </Button>
                    {previews.selfie ? (
                      <img src={previews.selfie} alt="selfie preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">ยังไม่ได้เลือกไฟล์</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <FormControlLabel
                control={<Checkbox checked={form.agree} onChange={(e) => setField('agree', e.target.checked)} />}
                label={
                  <Typography variant="body2">
                    ฉันยอมรับ{' '}
                    <MuiLink
                      component={Link}
                      to="/terms"
                      target="_blank"
                      underline="hover"
                      sx={{ color: accent }}
                    >
                      ข้อกำหนดและนโยบายความเป็นส่วนตัว
                    </MuiLink>
                  </Typography>
                }
              />

              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!canSubmit}
                  sx={{
                    py: 1.1, px: 6, fontWeight: 900,
                    borderRadius: 999, textTransform: 'none',
                    bgcolor: primaryMain,
                    boxShadow: `0 8px 16px ${alpha(primaryMain, 0.25)}`,
                    '&:hover': { bgcolor: darken(primaryMain, 0.08) },
                  }}
                >
                  {loading ? 'กำลังส่งข้อมูล…' : 'สร้างบัญชี'}
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" align="center">
                มีบัญชีแล้ว?{' '}
                <MuiLink
                  component={Link}
                  to="/login"
                  underline="hover"
                  sx={{ fontWeight: 700, color: accent }}
                >
                เข้าสู่ระบบ
                </MuiLink>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
