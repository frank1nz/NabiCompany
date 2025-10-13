import { Typography, Paper } from '@mui/material'
import { useAuth } from '../store/authStore'


export default function Dashboard() {
const { user } = useAuth()
return (
<Paper sx={{ p: 3 }}>
<Typography variant="h5">Welcome{user?.name ? `, ${user.name}` : ''}</Typography>
<Typography variant="body1" mt={1}>Use the top menu to manage Orders, Products, and KYC.</Typography>
</Paper>
)
}
