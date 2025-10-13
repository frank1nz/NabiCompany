import { useEffect, useState } from 'react'
import { Paper, Typography, Stack, Button, Avatar } from '@mui/material'
import api from '../lib/axios'


export default function KycReview() {
const [items, setItems] = useState([])
const base = import.meta.env.VITE_UPLOAD_BASE


const fetchList = () => api.get('/kyc').then((r)=>setItems(r.data || []))
useEffect(fetchList, [])


async function act(id, status) {
await api.patch(`/kyc/${id}`, { status })
fetchList()
}


return (
<Paper sx={{ p: 3 }}>
<Typography variant="h6" mb={2}>KYC Review</Typography>
<Stack gap={2}>
{items.map((x)=> (
<Stack key={x._id} direction="row" alignItems="center" gap={2}>
<Avatar>{x?.user?.name?.[0] || '?'}</Avatar>
<Typography sx={{ minWidth: 260 }}>{x?.user?.name} – {x?.user?.email}</Typography>
{x.docFront && <a href={`${base}/${x.docFront}`} target="_blank">Front</a>}
{x.docBack && <a href={`${base}/${x.docBack}`} target="_blank">Back</a>}
<Typography sx={{ flexGrow: 1, opacity: .7 }}>{x.status}</Typography>
<Button size="small" variant="contained" onClick={()=>act(x._id,'approved')}>Approve</Button>
<Button size="small" color="error" variant="outlined" onClick={()=>act(x._id,'rejected')}>Reject</Button>
</Stack>
))}
</Stack>
</Paper>
)
}