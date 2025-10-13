import { useEffect } from 'react'
import { Paper, Typography, Stack, Chip } from '@mui/material'
import { useAuth } from '../store/authStore'


export default function Status() {
const { user, fetchMe } = useAuth()


useEffect(() => { fetchMe() }, [])


const verified = user?.verified === true || user?.kycStatus === 'approved'
return (
<Paper sx={{ p: 3 }}>
<Typography variant="h6" mb={2}>My Verification Status</Typography>
<Stack direction="row" gap={2} alignItems="center">
<Typography>Account:</Typography>
<Chip label={user?.email || '-'} />
</Stack>
<Stack direction="row" gap={2} alignItems="center" mt={2}>
<Typography>Age/KYC:</Typography>
<Chip color={verified ? 'success' : 'warning'} label={verified ? 'Approved' : (user?.kycStatus || 'Pending') } />
</Stack>
<Typography mt={2} variant="body2" sx={{ opacity: .8 }}>
You must be verified to submit a lead.
</Typography>
</Paper>
)
}