import { useState } from 'react'
import { TextField, Button, Stack, Typography, Paper } from '@mui/material'
import { register } from '../lib/auth'


export default function Register() {
const [form, setForm] = useState({ name: '', email: '', password: '', age: 20 })
const [msg, setMsg] = useState('')
const [err, setErr] = useState('')


const setField = (k, v) => setForm((f)=>({ ...f, [k]: v }))


async function onSubmit(e) {
e.preventDefault()
setErr(''); setMsg('')
try {
await register(form)
setMsg('Registered! You can login now.')
} catch (e) {
setErr(e?.response?.data?.message || 'Register failed')
}
}


return (
<Paper sx={{ p: 4, maxWidth: 520, mx: 'auto' }}>
<Typography variant="h5" mb={2}>Create account</Typography>
<Stack component="form" gap={2} onSubmit={onSubmit}>
<TextField label="Name" value={form.name} onChange={(e)=>setField('name', e.target.value)} />
<TextField label="Email" value={form.email} onChange={(e)=>setField('email', e.target.value)} />
<TextField label="Password" type="password" value={form.password} onChange={(e)=>setField('password', e.target.value)} />
<TextField label="Age" type="number" value={form.age} onChange={(e)=>setField('age', Number(e.target.value))} />
{msg && <Typography color="success.main">{msg}</Typography>}
{err && <Typography color="error">{err}</Typography>}
<Button type="submit" variant="contained">Register</Button>
</Stack>
</Paper>
)
}