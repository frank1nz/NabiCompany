// src/pages/Register.jsx
import { useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Stack,
  Grid,
  TextField,
  Typography,
  Alert,
  Button,
  InputLabel,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Box,
  Divider,
} from '@mui/material';
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

const BRAND = { gold: '#D4AF37' };
const MAX_IMG_MB = 5;
const ACCEPT = 'image/jpeg,image/png,image/webp';

const initialState = {
  name: '',
  email: '',
  password: '',
  dob: '',
  phone: '',
  lineId: '',
  facebookProfileUrl: '',
  idCardImage: null,
  selfieWithId: null,
  agree: false,
};

function calcAge(dob) {
  if (!dob) return 0;
  const d = new Date(dob);
  const t = new Date();
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

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // พรีวิวรูป
  const previews = useMemo(
    () => ({
      idCard: form.idCardImage ? URL.createObjectURL(form.idCardImage) : '',
      selfie: form.selfieWithId ? URL.createObjectURL(form.selfieWithId) : '',
    }),
    [form.idCardImage, form.selfieWithId]
  );

  // validation เบื้องต้น
  const emailOk = /\S+@\S+\.\S+/.test(form.email);
  const pwOk = form.password.length >= 6;
  const age = calcAge(form.dob);
  const ageOk = age >= 20;
  const phoneOk = !form.phone || /^[0-9+\-()\s]{6,}$/.test(form.phone);
  const idOk = !!form.idCardImage;
  const selfieOk = !!form.selfieWithId;
  const agreeOk = form.agree === true;

  const canSubmit =
    form.name &&
    emailOk &&
    pwOk &&
    ageOk &&
    phoneOk &&
    idOk &&
    selfieOk &&
    agreeOk &&
    !loading;

  function handleFile(field) {
    return (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (!ACCEPT.split(',').includes(f.type)) {
        setError('อัปโหลดได้เฉพาะ JPG/PNG/WebP');
        return;
      }
      if (f.size > MAX_IMG_MB * 1024 * 1024) {
        setError(`ไฟล์เกิน ${MAX_IMG_MB}MB`);
        return;
      }
      setError('');
      setField(field, f);
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries({
        name: form.name,
        email: form.email,
        password: form.password,
        dob: form.dob,
        phone: form.phone,
        lineId: form.lineId,
        facebookProfileUrl: form.facebookProfileUrl,
      }).forEach(([k, v]) => fd.append(k, v ?? ''));

      if (form.idCardImage) fd.append('idCardImage', form.idCardImage);
      if (form.selfieWithId) fd.append('selfieWithId', form.selfieWithId);

      await register(fd);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 8 },
        px: 2,
        bgcolor: '#f7f7f8',
      }}
    >
      <Container maxWidth="md">
        {/* กรอบนอกของหน้า (card) */}
        <Paper
          component="form"
          onSubmit={onSubmit}
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: '2px solid rgba(0,0,0,.08)',
            boxShadow: '0 10px 28px rgba(0,0,0,.06)',
            bgcolor: '#fff',
          }}
        >
          <Stack spacing={3}>
            {/* Header */}
            <Box>
              <Typography variant="h5" fontWeight={900}>
                สมัครสมาชิกพร้อมยืนยันตัวตน
              </Typography>
              <Typography variant="body2" color="text.secondary">
                กรอกข้อมูลให้ครบถ้วนและอัปโหลดเอกสารเพื่อความปลอดภัยและเป็นไปตามข้อกำหนด
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {/* ฟอร์ม 2 คอลัมน์ที่บาลานซ์กัน */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="ชื่อ-นามสกุล"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="วันเดือนปีเกิด"
                  type="date"
                  value={form.dob}
                  onChange={(e) => setField('dob', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                  error={!!form.dob && !ageOk}
                  helperText={
                    form.dob ? (ageOk ? `อายุ ${age} ปี` : 'ต้องอายุอย่างน้อย 20 ปี') : ' '
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="อีเมล"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  required
                  fullWidth
                  error={!!form.email && !emailOk}
                  helperText={form.email && !emailOk ? 'รูปแบบอีเมลไม่ถูกต้อง' : ' '}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="รหัสผ่าน"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  required
                  fullWidth
                  error={!!form.password && !pwOk}
                  helperText={form.password && !pwOk ? 'อย่างน้อย 6 ตัวอักษร' : ' '}
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
                          aria-label="แสดง/ซ่อนรหัสผ่าน"
                        >
                          {showPw ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="เบอร์โทรศัพท์"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  fullWidth
                  error={!!form.phone && !phoneOk}
                  helperText={
                    form.phone && !phoneOk ? 'กรุณากรอกเฉพาะตัวเลข/สัญลักษณ์ที่เกี่ยวข้อง' : ' '
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIphoneOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="LINE ID"
                  value={form.lineId}
                  onChange={(e) => setField('lineId', e.target.value)}
                  fullWidth
                />
              </Grid>

              {/* Facebook กลับมา — วางคู่ LINE ให้บาลานซ์ (ครึ่ง-ครึ่ง) */}
              <Grid item xs={12} md={12}>
                <TextField
                  label="ลิงก์ Facebook (ถ้ามี)"
                  value={form.facebookProfileUrl}
                  onChange={(e) => setField('facebookProfileUrl', e.target.value)}
                  fullWidth
                  placeholder="https://facebook.com/your.profile"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkOutlined fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />

            {/* เอกสารยืนยันตัวตน: การ์ดเส้นประ จัดกึ่งกลาง */}
            <Typography variant="subtitle2" fontWeight={800}>
              เอกสารยืนยันตัวตน
            </Typography>

            <Grid container spacing={2} justifyContent="center">
              {/* ID Card */}
              <Grid item xs={12} md={6}>
                <InputLabel sx={{ mb: 1 }}>
                  บัตรประชาชน (≤ {MAX_IMG_MB}MB)
                </InputLabel>
                <Box
                  sx={{
                    border: '1px dashed rgba(0,0,0,.25)',
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: '#fcfcfc',
                    maxWidth: 420,
                    mx: 'auto',
                  }}
                >
                  <Button variant="outlined" startIcon={<UploadFileOutlined />} component="label">
                    เลือกไฟล์
                    <input hidden type="file" accept={ACCEPT} onChange={handleFile('idCardImage')} />
                  </Button>

                  {previews.idCard ? (
                    <img
                      src={previews.idCard}
                      alt="id preview"
                      style={{
                        width: 96,
                        height: 64,
                        objectFit: 'cover',
                        borderRadius: 6,
                        border: '1px solid #eee',
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      ยังไม่ได้เลือกไฟล์
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Selfie */}
              <Grid item xs={12} md={6}>
                <InputLabel sx={{ mb: 1 }}>
                  รูปถ่ายถือบัตร (≤ {MAX_IMG_MB}MB)
                </InputLabel>
                <Box
                  sx={{
                    border: '1px dashed rgba(0,0,0,.25)',
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: '#fcfcfc',
                    maxWidth: 420,
                    mx: 'auto',
                  }}
                >
                  <Button variant="outlined" startIcon={<UploadFileOutlined />} component="label">
                    เลือกไฟล์
                    <input hidden type="file" accept={ACCEPT} onChange={handleFile('selfieWithId')} />
                  </Button>

                  {previews.selfie ? (
                    <img
                      src={previews.selfie}
                      alt="selfie preview"
                      style={{
                        width: 96,
                        height: 64,
                        objectFit: 'cover',
                        borderRadius: 6,
                        border: '1px solid #eee',
                      }}
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      ยังไม่ได้เลือกไฟล์
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* ยอมรับเงื่อนไข */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.agree}
                  onChange={(e) => setField('agree', e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  ฉันยอมรับ{' '}
                  <MuiLink
                    component={Link}
                    to="/terms"
                    target="_blank"
                    underline="hover"
                    sx={{ color: BRAND.gold }}
                  >
                    ข้อกำหนดและนโยบายความเป็นส่วนตัว
                  </MuiLink>
                </Typography>
              }
            />

            {/* ปุ่มสมัครสมาชิก “กลางจอ” */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!canSubmit}
                sx={{
                  py: 1.1,
                  px: 5,
                  fontWeight: 900,
                  bgcolor: BRAND.gold,
                  color: '#111',
                  borderRadius: 3,
                  boxShadow: '0 6px 16px rgba(212,175,55,.25)',
                  '&:hover': { bgcolor: '#C6A132' },
                }}
              >
                {loading ? 'กำลังส่งข้อมูล…' : 'สมัครสมาชิก'}
              </Button>

              {!agreeOk && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  * กรุณาติ๊กยอมรับเงื่อนไขก่อนส่งข้อมูล
                </Typography>
              )}
            </Box>

            {/* ลิงก์ไปหน้า Login */}
            <Typography variant="body2" color="text.secondary" align="center">
              มีบัญชีแล้ว?{' '}
              <MuiLink component={Link} to="/login" underline="hover" sx={{ fontWeight: 700 }}>
                เข้าสู่ระบบ
              </MuiLink>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
