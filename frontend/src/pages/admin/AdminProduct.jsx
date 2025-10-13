import { useEffect, useState } from 'react'
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import api from '../../lib/axios'


export default function AdminProducts() {
const [rows, setRows] = useState([])
const fetchList = () => api.get('/products').then((r)=>setRows(r.data || []))
useEffect(fetchList, [])


return (
<Paper sx={{ p: 3 }}>
<Typography variant="h6" mb={2}>Manage Products</Typography>
<Table size="small">
<TableHead>
<TableRow>
<TableCell>Name</TableCell>
<TableCell>Price</TableCell>
<TableCell>Image</TableCell>
</TableRow>
</TableHead>
<TableBody>
{rows.map((x)=> (
<TableRow key={x._id}>
<TableCell>{x.name}</TableCell>
<TableCell>{x.price}</TableCell>
<TableCell>{x.image}</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</Paper>
)
}