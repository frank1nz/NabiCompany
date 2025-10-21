// src/pages/admin/AdminOrders.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, MenuItem, Select, Button, Stack, Chip, Box, Alert, IconButton,
  Toolbar, Divider, CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import { adminListOrders, adminUpdateOrderStatus } from '../../lib/orders';

const STATUS_OPTIONS = ['pending', 'confirmed', 'rejected', 'fulfilled', 'cancelled'];
const PAYMENT_OPTIONS = ['pending', 'paid', 'failed', 'expired'];

const STATUS_STYLES = {
  pending:   { color: '#8a6d3b', bg: 'rgba(212,175,55,.12)' }, // waiting (ทองหม่น)
  confirmed: { color: '#1b5e20', bg: 'rgba(76,175,80,.15)'  }, // เขียว
  rejected:  { color: '#b71c1c', bg: 'rgba(244,67,54,.15)'  }, // แดง
  fulfilled: { color: '#0d47a1', bg: 'rgba(33,150,243,.15)' }, // น้ำเงิน
  cancelled: { color: '#424242', bg: 'rgba(0,0,0,.08)'      }, // เทา
};

const PAYMENT_STYLES = {
  pending: { color: '#8a6d3b', bg: 'rgba(212,175,55,.12)' },
  paid:    { color: '#1b5e20', bg: 'rgba(76,175,80,.15)' },
  failed:  { color: '#b71c1c', bg: 'rgba(244,67,54,.15)' },
  expired: { color: '#424242', bg: 'rgba(0,0,0,.08)' },
};

const BRAND = { navy: '#1C2738', gold: '#D4AF37' };

function StatusChip({ value, styles = STATUS_STYLES, label }) {
  const s = styles[value] || {};
  return (
    <Chip
      label={label || value}
      size="small"
      sx={{
        fontWeight: 700,
        color: s.color || 'inherit',
        bgcolor: s.bg || 'rgba(0,0,0,.06)',
        textTransform: 'capitalize',
      }}
    />
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [noteDraft, setNoteDraft] = useState({});
  const [statusDraft, setStatusDraft] = useState({});
  const [paymentDraft, setPaymentDraft] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');      // กำลังบันทึกแถวไหน
  const [filter, setFilter] = useState('all');       // ฟิลเตอร์สถานะ

  async function loadOrders() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await adminListOrders();
      setOrders(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'โหลดคำสั่งซื้อไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const getId = (o) => o?.id || o?._id;

  const canSave = (o) => {
    const id = getId(o);
    const newStatus = statusDraft[id] ?? o.status;
    const newNote = noteDraft[id] ?? o.adminNote ?? '';
    const newPaymentStatus = paymentDraft[id] ?? o.payment?.status ?? 'pending';
    const originalPaymentStatus = o.payment?.status ?? 'pending';
    // มีการเปลี่ยนแปลงหรือไม่
    return (
      newStatus !== o.status ||
      newNote !== (o.adminNote ?? '') ||
      newPaymentStatus !== originalPaymentStatus
    );
  };

  async function handleUpdate(order) {
    const id = getId(order);
    setError('');
    setSuccess('');
    setSavingId(id);
    try {
      const statusValue = statusDraft[id] ?? order.status;
      const noteValue = noteDraft[id] ?? order.adminNote ?? '';
      const paymentValue = paymentDraft[id] ?? order.payment?.status ?? 'pending';

      const payload = {};
      if (statusValue !== order.status) payload.status = statusValue;
      if (noteValue !== (order.adminNote ?? '')) payload.adminNote = noteValue;
      if (paymentValue !== (order.payment?.status ?? 'pending')) payload.paymentStatus = paymentValue;

      if (!Object.keys(payload).length) {
        setSavingId('');
        return;
      }

      await adminUpdateOrderStatus(id, payload);
      setSuccess(`อัปเดตคำสั่งซื้อ #${id} เรียบร้อย`);
      await loadOrders();
      setStatusDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setNoteDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setPaymentDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'อัปเดตไม่ได้');
    } finally {
      setSavingId('');
    }
  }

  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      {/* Header / Filters */}
      <Toolbar
        sx={{
          px: 2, py: 1.5, gap: 1.5,
          justifyContent: 'space-between',
          bgcolor: 'rgba(28,39,56,0.03)',
          borderBottom: '1px solid rgba(0,0,0,.06)',
        }}
      >
        <Stack direction="row" alignItems="baseline" spacing={2}>
          <Typography variant="h6" fontWeight={900} sx={{ color: BRAND.navy }}>
            จัดการคำสั่งซื้อ
          </Typography>
          <Divider flexItem orientation="vertical" />
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterAltRoundedIcon fontSize="small" />
            <Select
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{ minWidth: 160, textTransform: 'capitalize' }}
            >
              <MenuItem value="all">All statuses</MenuItem>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>

        <IconButton onClick={loadOrders} title="รีเฟรช" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
      </Toolbar>

      <Box sx={{ px: 2, pt: 2 }}>
        {!!success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {!!error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>คำสั่งซื้อ</TableCell>
              <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>ลูกค้า</TableCell>
              <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>สถานะ</TableCell>
              <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>การชำระเงิน</TableCell>
              <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>ยอดรวม</TableCell>
              <TableCell sx={{ fontWeight: 700, color: BRAND.navy, width: 260 }}>Note</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: BRAND.navy }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((order) => {
              const id = getId(order);
              const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
              const statusValue = statusDraft[id] ?? order.status;
              const noteValue = noteDraft[id] ?? order.adminNote ?? '';
              const saving = savingId === id;

              return (
                <TableRow
                  key={id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,.02)' }, transition: 'background .15s' }}
                >
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {createdAt ? createdAt.toLocaleString() : '-'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{order.user?.name || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user?.email || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={1}>
                      <StatusChip value={order.status} />
                      <Select
                        size="small"
                        sx={{ minWidth: 160, textTransform: 'capitalize' }}
                        value={statusValue}
                        onChange={(e) =>
                          setStatusDraft((prev) => ({ ...prev, [id]: e.target.value }))
                        }
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Stack spacing={1}>
                      <StatusChip
                        value={order.payment?.status ?? 'pending'}
                        styles={PAYMENT_STYLES}
                      />
                      <Select
                        size="small"
                        sx={{ minWidth: 160, textTransform: 'capitalize' }}
                        value={paymentDraft[id] ?? order.payment?.status ?? 'pending'}
                        onChange={(e) =>
                          setPaymentDraft((prev) => ({ ...prev, [id]: e.target.value }))
                        }
                      >
                        {PAYMENT_OPTIONS.map((status) => (
                          <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                      {order.payment?.reference && (
                        <Typography variant="caption" color="text.secondary">
                          REF: {order.payment.reference}
                        </Typography>
                      )}
                      {order.payment?.target && (
                        <Typography variant="caption" color="text.secondary">
                          PromptPay: {order.payment.targetFormatted || order.payment.target}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    ฿ {Number(order.total || 0).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder="หมายเหตุ"
                      value={noteValue}
                      onChange={(e) =>
                        setNoteDraft((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SaveRoundedIcon />}
                      onClick={() => handleUpdate(order)}
                      disabled={!canSave(order) || saving}
                      sx={{
                        bgcolor: BRAND.gold,
                        color: '#111',
                        fontWeight: 800,
                        borderRadius: 20,
                        px: 2,
                        '&:hover': { bgcolor: '#C6A132' },
                      }}
                    >
                      {saving ? 'กำลังบันทึก…' : 'บันทึก'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {!filtered.length && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {orders.length ? 'ไม่พบรายการตามเงื่อนไขที่เลือก' : 'ยังไม่มีคำสั่งซื้อ'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
