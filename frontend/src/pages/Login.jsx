import { useState } from 'react'
import { TextField, Button, Stack, Typography, Paper } from '@mui/material'
import { login } from '../lib/auth'
import { useAuth } from '../store/authStore'


export default function Login() {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [err, setErr] = useState('')
const { setToken } = useAuth()


async function onSubmit(e) {
e.preventDefault()
setErr('')
try {
const { token } = await login({ email, password })
setToken(token)
window.location.href = '/'
} catch (e) {
setErr(e?.response?.data?.message || 'Login failed')
}
}


return (
<Paper sx={{ p: 4, maxWidth: 420, mx: 'auto' }}>
<Typography variant="h5" mb={2}>Sign in</Typography>
<Stack component="form" gap={2} onSubmit={onSubmit}>
<TextField label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
<TextField label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
{err && <Typography color="error">{err}</Typography>}
<Button type="submit" variant="contained">Login</Button>
</Stack>
</Paper>
)
}