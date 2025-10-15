// src/pages/KycReview.jsx
import { useEffect, useState, useMemo } from 'react';
import {
  Paper, Typography, Stack, Button, Avatar, Chip, Box, Divider,
  IconButton, Tooltip, Skeleton, Dialog, DialogTitle, DialogContent,
  DialogActions, Link as MuiLink
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import api from '../lib/axios';

const BRAND = { gold: '#D4AF37' };

const statusChip = (s) => {
  switch (s) {
    case 'approved':  return { color: 'success', label: 'approved' };
    case 'rejected':  return { color: 'error',   label: 'rejected' };
    default:          return { color: 'default', label: s || 'pending' };
  }
};

export default function KycReview() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, action: '' });

  const base = import.meta.env.VITE_UPLOAD_BASE;

  const fetchList = async () => {
    try {
      setErr('');
      setLoading(true);
      const r = await api.get('/kyc');
      setItems(r.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || 'โหลดรายการไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const onAsk = (id, action) => setConfirm({ open: true, id, action });
  const onClose = () => setConfirm({ open: false, id: null, action: '' });

  const onConfirm = async () => {
    if (!confirm.id) return;
    try {
      await api.patch(`/kyc/${confirm.id}`, { status: confirm.action });
      onClose();
      fetchList();
    } catch (e) {
      setErr(e?.response?.data?.message || 'อัปเดตสถานะไม่สำเร็จ');
    }
  };

  const totalPending = useMemo(
    () => items.filter(x => (x.status ?? 'pending') === 'pending').length,
    [items]
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6" fontWeight={900}>KYC Review</Typography>
        <Button
          size="small"
          startIcon={<RefreshRoundedIcon />}
          onClick={fetchList}
          sx={{ fontWeight: 800 }}
        >
          รีเฟรช
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        รายการรอตรวจ: <strong>{totalPending}</strong>
      </Typography>

      {err && (
        <Typography color="error.main" sx={{ mb: 2 }}>
          {err}
        </Typography>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Loading state */}
      {loading && (
        <Stack gap={2}>
          {[...Array(4)].map((_, i) => (
            <Stack key={i} direction="row" alignItems="center" gap={2}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="text" width={260} height={28} />
              <Skeleton variant="rounded" width={80} height={28} />
              <Skeleton variant="rounded" width={80} height={28} />
              <Skeleton variant="rounded" width={90} height={28} sx={{ ml: 'auto' }} />
            </Stack>
          ))}
        </Stack>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6 }}>
          <Typography>ยังไม่มีคำขอ KYC</Typography>
        </Box>
      )}

      {/* List */}
      {!loading && items.length > 0 && (
        <Stack gap={1.5}>
          {items.map((x) => {
            const s = statusChip(x.status);
            return (
              <Stack
                key={x._id}
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={2}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <Avatar sx={{ bgcolor: 'grey.200', color: 'text.primary' }}>
                  {x?.user?.name?.[0]?.toUpperCase() || '?'}
                </Avatar>

                <Box sx={{ minWidth: 260 }}>
                  <Typography fontWeight={700} sx={{ lineHeight: 1.1 }}>
                    {x?.user?.name || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {x?.user?.email || '—'}
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  {x.docFront && (
                    <Tooltip title="บัตรประชาชน (ด้านหน้า)">
                      <IconButton
                        size="small"
                        component={MuiLink}
                        href={`${base}/${x.docFront}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {x.docBack && (
                    <Tooltip title="บัตรประชาชน (ด้านหลัง/เซลฟี่)">
                      <IconButton
                        size="small"
                        component={MuiLink}
                        href={`${base}/${x.docBack}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                <Box sx={{ flexGrow: 1 }} />

                <Chip
                  label={s.label}
                  color={s.color}
                  size="small"
                  variant={s.color === 'default' ? 'outlined' : 'filled'}
                  sx={{ minWidth: 92, textTransform: 'capitalize' }}
                />

                <Stack direction="row" gap={1}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<CheckCircleOutlineIcon />}
                    onClick={() => onAsk(x._id, 'approved')}
                    sx={{ bgcolor: BRAND.gold, color: '#111', '&:hover': { bgcolor: '#C6A132' } }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={() => onAsk(x._id, 'rejected')}
                  >
                    Reject
                  </Button>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      )}

      {/* Confirm dialog */}
      <Dialog open={confirm.open} onClose={onClose}>
        <DialogTitle>
          {confirm.action === 'approved' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการปฏิเสธ'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography>
            ต้องการ
            <strong>
              {confirm.action === 'approved' ? ' อนุมัติ ' : ' ปฏิเสธ '}
            </strong>
            คำขอ KYC นี้หรือไม่
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>ยกเลิก</Button>
          <Button
            variant="contained"
            color={confirm.action === 'approved' ? 'success' : 'error'}
            onClick={onConfirm}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
