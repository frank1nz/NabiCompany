import { useEffect, useState } from 'react'
import {
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  Box,
} from '@mui/material'
import { fetchPendingKyc, approveKyc, rejectKyc } from '../../lib/admin'

const uploadBase = import.meta.env.VITE_UPLOAD_BASE

export default function AdminKyc() {
  const [users, setUsers] = useState([])
  const [noteDraft, setNoteDraft] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = () =>
    fetchPendingKyc()
      .then((data) => {
        setUsers(data)
        setError('')
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'โหลดรายการไม่สำเร็จ')
      })

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleApprove(userId) {
    setError('')
    setSuccess('')
    await approveKyc(userId)
    setSuccess('อนุมัติสำเร็จ')
    loadUsers()
  }

  async function handleReject(userId) {
    setError('')
    setSuccess('')
    await rejectKyc(userId, noteDraft[userId] || '')
    setSuccess('ปฏิเสธสำเร็จ')
    loadUsers()
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>ตรวจสอบ KYC</Typography>
      {success && <Typography color="success.main" mb={2}>{success}</Typography>}
      {error && <Typography color="error.main" mb={2}>{error}</Typography>}

      <Stack spacing={3}>
        {users.map((user) => (
          <Box key={user._id} sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle1">{user.profile?.name}</Typography>
                <Typography variant="body2">{user.email}</Typography>
                <Typography variant="body2" color="text.secondary">
                  DOB: {user.profile?.dob ? new Date(user.profile.dob).toLocaleDateString() : '-'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`Phone: ${user.profile?.phone || '-'}`} size="small" />
                  <Chip label={`LINE: ${user.profile?.lineId || '-'}`} size="small" />
                </Stack>
              </Stack>
              <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                <Typography variant="caption">เอกสาร</Typography>
                <Stack direction="row" spacing={1}>
                  {user.kyc?.idCardImagePath && (
                    <Button
                      size="small"
                      component="a"
                      href={`${uploadBase}/${user.kyc.idCardImagePath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      บัตรประชาชน
                    </Button>
                  )}
                  {user.kyc?.selfieWithIdPath && (
                    <Button
                      size="small"
                      component="a"
                      href={`${uploadBase}/${user.kyc.selfieWithIdPath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      เซลฟี่
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center" mt={2}>
              <TextField
                label="หมายเหตุ (กรณีปฏิเสธ)"
                size="small"
                fullWidth
                value={noteDraft[user._id] || ''}
                onChange={(e) => setNoteDraft((prev) => ({ ...prev, [user._id]: e.target.value }))}
              />
              <Button variant="contained" onClick={() => handleApprove(user._id)}>
                อนุมัติ
              </Button>
              <Button color="error" variant="outlined" onClick={() => handleReject(user._id)}>
                ปฏิเสธ
              </Button>
            </Stack>
          </Box>
        ))}
        {!users.length && (
          <Typography color="text.secondary">ไม่มีรายการที่รออนุมัติ</Typography>
        )}
      </Stack>
    </Paper>
  )
}
