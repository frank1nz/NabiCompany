import { useState } from 'react'
import { Paper, Typography, TextField, Button, Stack } from '@mui/material'
import api from '../lib/axios'


export default function LeadForm() {
const [form, setForm] = useState({ name: '', message: '' })
const [ok, setOk] = useState('')
const [err, setErr] = useState('')


const setField = (k, v) => setForm((f)=>({ ...f, [k]: v }))


async function onSubmit(e) {
e.preventDefault()
setOk(''); setErr('')
try {
await api.post('/leads', form) // user submits lead
setOk('Submitted!')
setForm({ name: '', message: '' })
} catch (e) {
setErr(e?.response?.data?.message || 'Failed')
}
}


return (
<Paper sx={{ p: 3 }}>
<Typography variant="h6" mb={2}>Submit a Lead</Typography>
<Stack component="form" gap={2} onSubmit={onSubmit}>
<TextField label="Topic / Product" value={form.name} onChange={(e)=>setField('name', e.target.value)} />
<TextField label="Message" value={form.message} onChange={(e)=>setField('message', e.target.value)} multiline rows={4} />
{ok && <Typography color="success.main">{ok}</Typography>}
{err && <Typography color="error">{err}</Typography>}
<Button type="submit" variant="contained">Send</Button>
</Stack>
</Paper>
)
}