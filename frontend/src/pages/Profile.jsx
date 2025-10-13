import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Paper, Typography, Stack, Chip } from '@mui/material'
import { getUserById } from '../lib/user'
import { useAuth } from '../store/authStore'


export default function Profile() {
const { id } = useParams()
const { user, loading } = useAuth()
const [profile, setProfile] = useState(null)
const [err, setErr] = useState('')


useEffect(() => {
(async () => {
try { setProfile(await getUserById(id)) }
catch (e) { setErr(e?.response?.data?.message || 'Error') }
})()
}, [id])


if (loading) return null
// ป้องกันผู้ใช้กดดู id คนอื่นโดยตรง (frontend) — backend ก็กันไว้แล้วเช่นกัน
const isSelf = user && String(user.id || user._id) === String(id)
const isAdmin = user?.role === 'admin'
if (!isSelf && !isAdmin) return <Navigate to="/" replace />


return (
<Paper sx={{ p: 3 }}>
<Typography variant="h6" mb={2}>Profile</Typography>
{err && <Typography color="error">{err}</Typography>}
{profile && (
<Stack gap={1}>
<Typography><b>Name:</b> {profile.name}</Typography>
<Typography><b>Email:</b> {profile.email}</Typography>
<Typography><b>Role:</b> {profile.role}</Typography>
<Stack direction="row" gap={1}>
<Chip label={`Verified: ${profile.verified ? 'Yes' : 'No'}`} color={profile.verified ? 'success' : 'warning'} />
<Chip label={`KYC: ${profile.kycStatus}`} />
</Stack>
{profile.age != null && <Typography><b>Age:</b> {profile.age}</Typography>}
<Typography sx={{ opacity: .7 }}>User ID: {profile.id}</Typography>
</Stack>
)}
</Paper>
)
}