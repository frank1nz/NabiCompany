// src/pages/admin/AdminKyc.jsx
import { useEffect, useState } from 'react'
import {
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Chip,
  Box,
  Divider,
  Card,
  CardContent,
  CardHeader,
  useTheme,
} from '@mui/material'
import { darken } from '@mui/material/styles'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import { fetchPendingKyc, approveKyc, rejectKyc } from '../../lib/admin'
const uploadBase = import.meta.env.VITE_UPLOAD_BASE

export default function AdminKyc() {
  const [users, setUsers] = useState([])
  const [noteDraft, setNoteDraft] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const theme = useTheme()
  const accent = theme.palette.secondary.main

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
    setSuccess('✅ อนุมัติสำเร็จ')
    loadUsers()
  }

  async function handleReject(userId) {
    setError('')
    setSuccess('')
    await rejectKyc(userId, noteDraft[userId] || '')
    setSuccess('❌ ปฏิเสธสำเร็จ')
    loadUsers()
  }

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={900} mb={3}>
        ตรวจสอบคำขอ KYC
      </Typography>

      {success && (
        <Typography color="success.main" mb={2} fontWeight={600}>
          {success}
        </Typography>
      )}
      {error && (
        <Typography color="error.main" mb={2} fontWeight={600}>
          {error}
        </Typography>
      )}

      {users.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          ไม่มีรายการรออนุมัติ
        </Paper>
      ) : (
        <Stack spacing={3}>
          {users.map((user) => (
            <Card
              key={user._id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                boxShadow: '0 3px 10px rgba(0,0,0,0.04)',
                borderColor: 'rgba(0,0,0,0.08)',
              }}
            >
              <CardHeader
                avatar={<AssignmentIndOutlinedIcon color="primary" />}
                title={
                  <Typography fontWeight={700}>
                    {user.profile?.name || 'ไม่ระบุชื่อ'}
                  </Typography>
                }
                subheader={user.email}
              />
              <Divider />
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  gap={3}
                >
                  {/* ข้อมูลส่วนตัว */}
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      DOB:{' '}
                      {user.profile?.dob
                        ? new Date(user.profile.dob).toLocaleDateString()
                        : '-'}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={`Phone: ${user.profile?.phone || '-'}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`LINE: ${user.profile?.lineId || '-'}`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  {/* เอกสารแนบ */}
                  <Stack alignItems="flex-end" spacing={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      เอกสารแนบ
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {user.kyc?.idCardImagePath && (
                        <Button
                          size="small"
                          variant="outlined"
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
                          variant="outlined"
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

                {/* ช่องใส่หมายเหตุ + ปุ่มดำเนินการ */}
                <Divider sx={{ my: 2 }} />
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  gap={2}
                  alignItems="center"
                >
                  <TextField
                    label="หมายเหตุ (กรณีปฏิเสธ)"
                    size="small"
                    fullWidth
                    value={noteDraft[user._id] || ''}
                    onChange={(e) =>
                      setNoteDraft((prev) => ({
                        ...prev,
                        [user._id]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={() => handleApprove(user._id)}
                    sx={{
                      fontWeight: 700,
                      px: 2.5,
                      color: theme.palette.secondary.contrastText,
                      bgcolor: accent,
                      '&:hover': { bgcolor: darken(accent, 0.12) },
                    }}
                  >
                    อนุมัติ
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={() => handleReject(user._id)}
                    sx={{ fontWeight: 700, px: 2.5 }}
                  >
                    ปฏิเสธ
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  )
}
