import { useEffect, useState } from 'react'
import { Paper, Typography, Grid, Card, CardContent, CardMedia } from '@mui/material'
import api from '../lib/axios'


export default function Products({ compact = false }) {
const [items, setItems] = useState([])
const base = import.meta.env.VITE_UPLOAD_BASE


useEffect(() => {
api.get('/products').then((r)=>setItems(r.data || []))
}, [])


const list = compact ? items.slice(0, 6) : items


return (
<Paper sx={{ p: 3 }}>
{!compact && <Typography variant="h6" mb={2}>Products</Typography>}
<Grid container spacing={2}>
{list.map((p)=> (
<Grid item xs={12} sm={6} md={4} key={p._id}>
<Card>
{p.image && <CardMedia component="img" height="180" image={`${base}/${p.image}`} alt={p.name} />}
<CardContent>
<Typography variant="subtitle1">{p.name}</Typography>
{p.price != null && <Typography variant="body2">฿ {Number(p.price).toLocaleString()}</Typography>}
</CardContent>
</Card>
</Grid>
))}
</Grid>
</Paper>
)
}