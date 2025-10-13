import { useState } from 'react'
import {
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  Alert,
  InputLabel,
} from '@mui/material'
import { register } from '../lib/auth'

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
}

export default function Register() {
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const setField = (field, value) =>
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))

  const handleFile = (field) => (event) => {
    const file = event.target.files?.[0] || null
    setField(field, file)
  }

  async function onSubmit(event) {
    event.preventDefault()
    setSuccess('')
    setError('')
    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('email', form.email)
      fd.append('password', form.password)
      fd.append('dob', form.dob)
      fd.append('phone', form.phone)
      fd.append('lineId', form.lineId)
      fd.append('facebookProfileUrl', form.facebookProfileUrl)
      if (form.idCardImage) fd.append('idCardImage', form.idCardImage)
      if (form.selfieWithId) fd.append('selfieWithId', form.selfieWithId)

      await register(fd)
      window.location.href = '/login'
    } catch (err) {
      setError(err?.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h5" mb={2}>สมัครสมาชิกพร้อมยืนยันตัวตน</Typography>
      <Typography variant="body2" mb={3}>
        กรอกข้อมูลให้ครบถ้วนและอัปโหลดรูปบัตรประชาชนพร้อมรูปถ่ายคู่บัตรเพื่อส่งให้แอดมินตรวจสอบ
      </Typography>

      <Stack component="form" gap={2} onSubmit={onSubmit}>
        <TextField
          label="ชื่อ-นามสกุล"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          required
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="อีเมล"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            type="email"
            required
            fullWidth
          />
          <TextField
            label="รหัสผ่าน"
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            required
            fullWidth
          />
        </Stack>
        <TextField
          label="วันเดือนปีเกิด"
          type="date"
          value={form.dob}
          onChange={(e) => setField('dob', e.target.value)}
          InputLabelProps={{ shrink: true }}
          required
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="เบอร์โทรศัพท์"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            fullWidth
          />
          <TextField
            label="LINE ID"
            value={form.lineId}
            onChange={(e) => setField('lineId', e.target.value)}
            fullWidth
          />
        </Stack>
        <TextField
          label="ลิงก์ Facebook (ถ้ามี)"
          value={form.facebookProfileUrl}
          onChange={(e) => setField('facebookProfileUrl', e.target.value)}
        />

        <Stack spacing={2}>
          <div>
            <InputLabel>รูปบัตรประชาชน (ด้านหน้า)</InputLabel>
            <Button variant="outlined" component="label" sx={{ mt: 1 }}>
              เลือกไฟล์
              <input type="file" hidden accept="image/*" onChange={handleFile('idCardImage')} />
            </Button>
            {form.idCardImage && (
              <Typography variant="caption" display="block" mt={0.5}>
                {form.idCardImage.name}
              </Typography>
            )}
          </div>
          <div>
            <InputLabel>รูปถ่ายถือบัตรประชาชน</InputLabel>
            <Button variant="outlined" component="label" sx={{ mt: 1 }}>
              เลือกไฟล์
              <input type="file" hidden accept="image/*" onChange={handleFile('selfieWithId')} />
            </Button>
            {form.selfieWithId && (
              <Typography variant="caption" display="block" mt={0.5}>
                {form.selfieWithId.name}
              </Typography>
            )}
          </div>
        </Stack>

        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'กำลังส่งข้อมูล...' : 'สมัครสมาชิก'}
        </Button>
      </Stack>
    </Paper>
  )
}
