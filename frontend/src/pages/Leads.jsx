import { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import api from '../lib/axios'


export default function Leads() {
const [rows, setRows] = useState([])


useEffect(() => {
api.get('/leads').then((r)=>setRows(r.data || [])).catch(()=>setRows([]))
}, [])


return (
<Paper sx={{ p: 3 }}>
<Typography variant="h6" mb={2}>Leads</Typography>
<Table size="small">
<TableHead>
<TableRow>
<TableCell>Name</TableCell>
<TableCell>Email</TableCell>
<TableCell>Created</TableCell>
</TableRow>
</TableHead>
<TableBody>
{rows.map((x)=> (
<TableRow key={x._id}>
<TableCell>{x.name}</TableCell>
<TableCell>{x.email}</TableCell>
<TableCell>{x.createdAt ? new Date(x.createdAt).toLocaleString() : '-'}</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</Paper>
)
}