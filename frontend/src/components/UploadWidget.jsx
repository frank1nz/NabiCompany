import { useState } from 'react'
import { Stack, Button, LinearProgress } from '@mui/material'
import api from '../lib/axios'


export default function UploadWidget() {
const [loading, setLoading] = useState(false)
async function onFile(e) {
const file = e.target.files?.[0]
if (!file) return
const fd = new FormData()
fd.append('file', file)
setLoading(true)
try { await api.post('/uploads', fd) } finally { setLoading(false) }
}
return (
<Stack gap={1}>
<Button component="label" variant="outlined">Choose file<input hidden type="file" onChange={onFile} /></Button>
{loading && <LinearProgress />}
</Stack>
)
}