// src/pages/Profile.jsx
import { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Paper, Typography, Stack, Chip, Divider, Button,
  Box, Avatar, Skeleton, IconButton, Tooltip, Link as MuiLink, useTheme
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getUserById } from '../lib/user';
import { useAuth } from '../store/authStore';
const uploadBase = import.meta.env.VITE_UPLOAD_BASE;

export default function Profile() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const theme = useTheme();
  const brand = theme.palette.brand;
  const headerGradient = `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getUserById(id);
        if (!alive) return;
        setProfile(data);
        setError('');
      } catch (err) {
        setError(err?.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (authLoading) return null;

  const selfId  = user?.id || user?._id;
  const isSelf  = selfId && String(selfId) === String(id);
  const isAdmin = user?.role === 'admin';
  if (!isSelf && !isAdmin) return <Navigate to="/" replace />;

  const p    = useMemo(() => profile?.profile || {}, [profile]);
  const kyc  = profile?.kyc || {};
  const role = profile?.role || '-';

  const chips = {
    age: {
      label: profile?.ageVerified ? 'Age verified' : 'Age pending',
      color: profile?.ageVerified ? 'success' : 'warning',
    },
    kyc: {
      label: `KYC: ${profile?.kycStatus || 'none'}`,
      color:
        profile?.kycStatus === 'approved' ? 'success' :
        profile?.kycStatus === 'rejected' ? 'error'  :
        profile?.kycStatus === 'pending'  ? 'warning': 'default',
    },
    ready: {
      label: profile?.isVerified ? 'Ready to order' : 'Awaiting approval',
      color: profile?.isVerified ? 'success' : 'warning',
    },
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,.06)',
        boxShadow: '0 8px 24px rgba(0,0,0,.05)',
        overflow: 'hidden',
      }}
      elevation={0}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'relative',
          px: { xs: 2, md: 3 },
          py: { xs: 3, md: 4 },
          background: headerGradient,
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {loading ? (
            <>
              <Skeleton variant="circular" width={56} height={56} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton width={200} height={28} />
                <Skeleton width={280} height={20} />
              </Box>
            </>
          ) : (
            <>
              <Avatar sx={{ width: 56, height: 56, bgcolor: brand?.navy || theme.palette.primary.main }}>
                {(p?.name || profile?.email || '?')?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={900} noWrap>
                  {p?.name || 'ไม่ระบุชื่อ'}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {profile?.email}
                </Typography>
              </Box>
              <Chip
                label={`Role: ${role}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </>
          )}
        </Stack>

        {!loading && (
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
            <Chip label={chips.age.label} size="small" color={chips.age.color} />
            <Chip label={chips.kyc.label} size="small" color={chips.kyc.color} />
            <Chip label={chips.ready.label} size="small" color={chips.ready.color} />
            <Chip
              label={`User ID: ${profile?.id || '-'}`}
              size="small"
              variant="outlined"
              onDelete={() => copy(profile?.id || '')}
              deleteIcon={
                <Tooltip title="คัดลอก">
                  <ContentCopyIcon fontSize="small" />
                </Tooltip>
              }
            />
          </Stack>
        )}
      </Box>

      {/* Error */}
      {!!error && (
        <Typography color="error.main" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Content */}
      <Stack spacing={3}>
        {/* Contact */}
        <Box>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
            ข้อมูลการติดต่อ
          </Typography>
          {loading ? (
            <Stack spacing={0.5}>
              <Skeleton width={220} />
              <Skeleton width={220} />
              <Skeleton width={360} />
            </Stack>
          ) : (
            <Stack spacing={0.5}>
              <Typography variant="body2">Phone: {p?.phone || '-'}</Typography>
              <Typography variant="body2">
                LINE: {p?.lineId ? (
                  <>
                    {p.lineId}{' '}
                    <IconButton size="small" onClick={() => copy(p.lineId)} aria-label="คัดลอก LINE ID">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : '-'}
              </Typography>
              <Typography variant="body2">
                Facebook:{' '}
                {p?.facebookProfileUrl ? (
                  <MuiLink href={p.facebookProfileUrl} target="_blank" rel="noreferrer" underline="hover">
                    เปิดลิงก์ <OpenInNewIcon sx={{ verticalAlign: 'middle', fontSize: 16, ml: 0.5 }} />
                  </MuiLink>
                ) : '-'}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                Address: {p?.address || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                DOB: {p?.dob ? new Date(p.dob).toLocaleDateString() : '-'}
              </Typography>
            </Stack>
          )}
        </Box>

        <Divider />

        {/* KYC */}
        <Box>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
            ข้อมูล KYC
          </Typography>

          {loading ? (
            <Stack spacing={0.5}>
              <Skeleton width={180} />
              <Skeleton width={280} />
            </Stack>
          ) : (
            <>
              {kyc?.status ? (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  สถานะ: {kyc.status}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ยังไม่มีข้อมูล KYC
                </Typography>
              )}

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {kyc?.idCardImagePath && (
                  <Button
                    size="small"
                    variant="outlined"
                    component="a"
                    href={`${uploadBase}/${kyc.idCardImagePath}`}
                    target="_blank"
                    rel="noreferrer"
                    endIcon={<OpenInNewIcon />}
                  >
                    ดูบัตรประชาชน
                  </Button>
                )}
                {kyc?.selfieWithIdPath && (
                  <Button
                    size="small"
                    variant="outlined"
                    component="a"
                    href={`${uploadBase}/${kyc.selfieWithIdPath}`}
                    target="_blank"
                    rel="noreferrer"
                    endIcon={<OpenInNewIcon />}
                  >
                    ดูรูปถ่ายคู่บัตร
                  </Button>
                )}
              </Stack>

              {kyc?.note && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  หมายเหตุจากแอดมิน: {kyc.note}
                </Typography>
              )}
            </>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
