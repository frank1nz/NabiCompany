import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
  useTheme,
} from '@mui/material';

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export default function Contact() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [sending, setSending] = useState(false);

  const emailTrimmed = (form.email || '').trim().toLowerCase();
  const emailValid =
    emailTrimmed.length === 0 ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);

  function handleChange(field) {
    return (e) => {
      const value = e.target.value || '';
      if (field === 'email') {
        setForm((f) => ({ ...f, email: value.toLowerCase() }));
      } else {
        setForm((f) => ({ ...f, [field]: value }));
      }
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!emailTrimmed || !emailValid) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }
    if (!form.message.trim()) {
      setError('กรุณากรอกข้อความที่ต้องการติดต่อ');
      return;
    }

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      setError('ระบบยังไม่ได้ตั้งค่า EmailJS กรุณาติดต่อผู้ดูแลระบบ');
      return;
    }

    setSending(true);
    try {
      const payload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          from_name: form.name || 'Nabi visitor',
          from_email: emailTrimmed,
          message: form.message.trim(),
          to_email: CONTACT_EMAIL,
        },
      };

      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('ไม่สามารถส่งอีเมลได้ในขณะนี้');
      }

      setInfo('ส่งข้อความเรียบร้อย ขอบคุณที่ติดต่อเรา');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err?.message || 'ส่งข้อความไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setSending(false);
    }
  }

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '60vh',
        py: { xs: 3, md: 4 },
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 600,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,.06)',
          boxShadow: '0 10px 30px rgba(0,0,0,.05)',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h5" fontWeight={900}>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              หากคุณมีคำถาม ข้อเสนอแนะ หรือสนใจผลิตภัณฑ์ของเรา
              สามารถกรอกแบบฟอร์มด้านล่างเพื่อส่งอีเมลหาเราได้เลย
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {info && <Alert severity="success">{info}</Alert>}

          <Stack spacing={1.5}>
            <TextField
              label="ชื่อของคุณ"
              value={form.name}
              onChange={handleChange('name')}
              fullWidth
            />
            <TextField
              label="อีเมลสำหรับติดต่อกลับ"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              error={!!form.email && !emailValid}
              helperText={
                !!form.email && !emailValid
                  ? 'กรุณากรอกอีเมลให้ถูกต้อง (ใช้ตัวพิมพ์เล็ก)'
                  : ' '
              }
              fullWidth
              required
            />
            <TextField
              label="ข้อความ"
              value={form.message}
              onChange={handleChange('message')}
              multiline
              minRows={4}
              fullWidth
              required
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            disabled={sending}
            sx={{
              alignSelf: 'flex-start',
              mt: 1,
              px: 3,
              fontWeight: 800,
              borderRadius: 999,
              bgcolor: brand?.blue2 || theme.palette.primary.main,
            }}
          >
            {sending ? 'กำลังส่ง…' : 'ส่งข้อความ'}
          </Button>

          <Typography variant="caption" color="text.secondary">
            อีเมลจะถูกส่งไปยัง: {CONTACT_EMAIL}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
