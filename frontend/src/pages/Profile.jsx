import { useEffect, useState, useMemo } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import {
  Paper,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
} from '@mui/material'
import { getUserById } from '../lib/user'
import { useAuth } from '../store/authStore'

const uploadBase = import.meta.env.VITE_UPLOAD_BASE

export default function Profile() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getUserById(id)
        setProfile(data)
      } catch (err) {
        setError(err?.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้')
      }
    })()
  }, [id])

  if (loading) return null
  const selfId = user?.id || user?._id
  const isSelf = selfId && String(selfId) === String(id)
  const isAdmin = user?.role === 'admin'
  if (!isSelf && !isAdmin) return <Navigate to="/" replace />

  const profileInfo = useMemo(() => profile?.profile || {}, [profile])
  const kyc = profile?.kyc || {}

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>ข้อมูลผู้ใช้</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {profile && (
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle1">{profileInfo.name}</Typography>
            <Typography variant="body2">{profile.email}</Typography>
            <Typography variant="body2" color="text.secondary">
              Role: {profile.role}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              User ID: {profile.id}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Chip
              label={profile.ageVerified ? 'Age verified' : 'Age pending'}
              color={profile.ageVerified ? 'success' : 'warning'}
              size="small"
            />
            <Chip
              label={`KYC: ${profile.kycStatus}`}
              color={profile.kycStatus === 'approved' ? 'success' : 'default'}
              size="small"
            />
            <Chip
              label={profile.isVerified ? 'Ready to order' : 'Awaiting approval'}
              color={profile.isVerified ? 'success' : 'warning'}
              size="small"
            />
          </Stack>

          <Divider />

          <Stack spacing={0.5}>
            <Typography variant="subtitle2">ข้อมูลการติดต่อ</Typography>
            <Typography variant="body2">Phone: {profileInfo.phone || '-'}</Typography>
            <Typography variant="body2">LINE: {profileInfo.lineId || '-'}</Typography>
            <Typography variant="body2">
              Facebook: {profileInfo.facebookProfileUrl ? (
                <a href={profileInfo.facebookProfileUrl} target="_blank" rel="noreferrer">
                  {profileInfo.facebookProfileUrl}
                </a>
              ) : '-'}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={0.5}>
            <Typography variant="subtitle2">ข้อมูล KYC</Typography>
            {kyc.status ? (
              <Typography variant="body2">สถานะ: {kyc.status}</Typography>
            ) : (
              <Typography variant="body2">ยังไม่มีข้อมูล KYC</Typography>
            )}
            <Stack direction="row" spacing={1}>
              {kyc.idCardImagePath && (
                <Button
                  size="small"
                  component="a"
                  href={`${uploadBase}/${kyc.idCardImagePath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ดูบัตรประชาชน
                </Button>
              )}
              {kyc.selfieWithIdPath && (
                <Button
                  size="small"
                  component="a"
                  href={`${uploadBase}/${kyc.selfieWithIdPath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  ดูรูปถ่ายคู่บัตร
                </Button>
              )}
            </Stack>
            {kyc.note && (
              <Typography variant="body2" color="error">
                หมายเหตุจากแอดมิน: {kyc.note}
              </Typography>
            )}
          </Stack>
        </Stack>
      )}
    </Paper>
  )
}
