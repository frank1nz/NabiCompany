import { useState } from 'react'
import { TextField, Button, Stack, Typography, Paper, Alert } from '@mui/material'
import { login } from '../lib/auth'
import { useAuth } from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setToken, setUser, fetchMe } = useAuth()

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login({ email, password })
      setToken(data.token)
      if (data.user) {
        setUser(data.user)
      }
      await fetchMe()
      window.location.href = '/'
    } catch (err) {
      setError(err?.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 420, mx: 'auto' }}>
      <Typography variant="h5" mb={2}>เข้าสู่ระบบ</Typography>
      <Stack component="form" gap={2} onSubmit={onSubmit}>
        <TextField
          label="อีเมล"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="รหัสผ่าน"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </Button>
      </Stack>
    </Paper>
  )
}
