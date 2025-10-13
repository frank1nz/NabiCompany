import { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material'
import api from '../../lib/axios'


export default function AdminLeads() {
const [rows, setRows] = useState([])
const [reply, setReply] = useState('')


const fetchList = () => api.get('/leads').then((r)=>setRows(r.data || []))
useEffect(fetchList, [])


async function sendReply(id) {
await api.post(`/leads/${id}/reply`, { message: reply })
setReply('')
fetchList()
}


return (
<Paper sx={{ p: 3 }}>
<Typography variant="h6" mb={2}>User Leads</Typography>
<Table size="small">
<TableHead>
<TableRow>
<TableCell>User</TableCell>
<TableCell>Topic</TableCell>
<TableCell>Message</TableCell>
<TableCell>Reply</TableCell>
<TableCell>Action</TableCell>
</TableRow>
</TableHead>
<TableBody>
{rows.map((x)=> (
<TableRow key={x._id}>
<TableCell>{x.user?.email}</TableCell>
<TableCell>{x.name}</TableCell>
<TableCell>{x.message}</TableCell>
<TableCell>{x.reply || '-'}</TableCell>
<TableCell>
<TextField size="small" value={reply} onChange={(e)=>setReply(e.target.value)} />
<Button size="small" sx={{ ml: 1 }} onClick={()=>sendReply(x._id)}>Send</Button>
</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</Paper>
)
}