import { useMemo, useState } from 'react';
import {
  Container, Paper, Stack, Grid, TextField, Typography, Alert, Button,
  InputLabel, Link as MuiLink, IconButton, InputAdornment, Checkbox,
  FormControlLabel, Box, Divider,
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
import logo from '../assets/nabi_logo_no_bg.png';

const BRAND = { gold: '#D4AF37', blue1: '#5DB3FF', blue2: '#257CFF' };
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

  const inputCapsuleSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 16,           // มนน้อยลง
      bgcolor: '#EAF3FF',
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: 'transparent' },
      '&.Mui-focused fieldset': { borderColor: BRAND.blue2 },
      px: 1,
    },
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'grid',
        placeItems: 'center',
        py: { xs: 3, md: 6 },
        px: 2,
        bgcolor: '#F5F7FB',
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,.06)',
            boxShadow: '0 16px 40px rgba(0,0,0,.08)',
            display: 'grid',
            // หดแผงซ้ายลงเพื่อให้ฝั่งฟอร์มยาวขึ้น
            gridTemplateColumns: { xs: '1fr', md: 'clamp(170px,20vw,220px) 1fr' },
          }}
        >
          {/* ฝั่งซ้าย */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              p: 4,
              background: `linear-gradient(180deg, ${BRAND.blue1} 0%, ${BRAND.blue2} 100%)`,
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
                  width: 82, height: 82, borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,.18)',
                  display: 'grid', placeItems: 'center',
                  backdropFilter: 'blur(2px)', overflow: 'hidden',
                }}
              >
                <img src={logo} alt="Nabi Spirits Logo" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
              </Box>
              <Typography variant="h6" fontWeight={800} letterSpacing={1}>
                NABI SPIRITS
              </Typography>
            </Stack>
          </Box>

          {/* ฝั่งขวา */}
          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
              p: { xs: 3, md: 5 },
              bgcolor: '#fff',
              maxWidth: 980,        // ← ทำให้แถวกว้างขึ้น
              mx: 'auto',           // จัดกึ่งกลาง
              width: '100%',
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" fontWeight={900} color="#2B4A73" sx={{ mb: .5 }}>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  สมัครสมาชิกและยืนยันตัวตนเพื่อสั่งซื้อและติดตามคำสั่งซื้อ
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              {/* ===== ฟอร์ม: 2 ช่องต่อแถว (md ขึ้นไป) ===== */}
              <Grid container columns={12} columnSpacing={3} rowSpacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="ชื่อ-นามสกุล"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required fullWidth sx={inputCapsuleSx}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlined fontSize="small" /></InputAdornment>) }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="วันเดือนปีเกิด" type="date" value={form.dob}
                    onChange={(e) => setField('dob', e.target.value)}
                    InputLabelProps={{ shrink: true }} required fullWidth
                    error={!!form.dob && !ageOk}
                    helperText={form.dob ? (ageOk ? `อายุ ${age} ปี` : 'ต้องอายุอย่างน้อย 20 ปี') : ' '}
                    sx={inputCapsuleSx}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarMonthOutlined fontSize="small" /></InputAdornment>) }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="อีเมล" type="email" value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    required fullWidth error={!!form.email && !emailOk}
                    helperText={form.email && !emailOk ? 'รูปแบบอีเมลไม่ถูกต้อง' : ' '}
                    sx={inputCapsuleSx}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlined fontSize="small" /></InputAdornment>) }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="รหัสผ่าน" type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={(e) => setField('password', e.target.value)}
                    required fullWidth error={!!form.password && !pwOk}
                    helperText={form.password && !pwOk ? 'อย่างน้อย 6 ตัวอักษร' : ' '}
                    sx={inputCapsuleSx}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start"><LockOutlined fontSize="small" /></InputAdornment>),
                      endAdornment: (
                        <InputAdornment position="end">
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
                    onChange={(e) => setField('phone', e.target.value)}
                    fullWidth error={!!form.phone && !phoneOk}
                    helperText={form.phone && !phoneOk ? 'กรุณากรอกเฉพาะตัวเลข/สัญลักษณ์ที่เกี่ยวข้อง' : ' '}
                    sx={inputCapsuleSx}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneIphoneOutlined fontSize="small" /></InputAdornment>) }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="LINE ID" value={form.lineId}
                    onChange={(e) => setField('lineId', e.target.value)}
                    fullWidth sx={inputCapsuleSx}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="ลิงก์ Facebook (ถ้ามี)" value={form.facebookProfileUrl}
                    onChange={(e) => setField('facebookProfileUrl', e.target.value)}
                    fullWidth placeholder="https://facebook.com/your.profile"
                    sx={inputCapsuleSx}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><LinkOutlined fontSize="small" /></InputAdornment>) }}
                  />
                </Grid>

                {/* ที่อยู่: ให้กว้างเต็มแถว */}
                <Grid item xs={12} md={12}>
                  <TextField
                    label="ที่อยู่สำหรับจัดส่ง"
                    value={form.address}
                    onChange={(e) => setField('address', e.target.value)}
                    required fullWidth multiline minRows={3}
                    placeholder="บ้านเลขที่ / อาคาร / ถนน / แขวง / เขต / จังหวัด / รหัสไปรษณีย์"
                    sx={{
                      ...inputCapsuleSx,
                      '& .MuiOutlinedInput-root': {
                        ...inputCapsuleSx['& .MuiOutlinedInput-root'],
                        borderRadius: 12,
                        bgcolor: '#F3F7FF',
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
                  <Box sx={{ border: '1px dashed rgba(0,0,0,.25)', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fcfcfc', maxWidth: 520, mx: 'auto' }}>
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
                  <Box sx={{ border: '1px dashed rgba(0,0,0,.25)', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fcfcfc', maxWidth: 520, mx: 'auto' }}>
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
                    <MuiLink component={Link} to="/terms" target="_blank" underline="hover" sx={{ color: BRAND.gold }}>
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
                    bgcolor: '#2F7BFF', boxShadow: '0 8px 16px rgba(47,123,255,.25)',
                    '&:hover': { bgcolor: '#1F6BEE' },
                  }}
                >
                  {loading ? 'กำลังส่งข้อมูล…' : 'สร้างบัญชี'}
                </Button>
                {!agreeOk && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    * กรุณาติ๊กยอมรับเงื่อนไขก่อนส่งข้อมูล
                  </Typography>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" align="center">
                มีบัญชีแล้ว?{' '}
                <MuiLink component={Link} to="/login" underline="hover" sx={{ fontWeight: 700 }}>
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
