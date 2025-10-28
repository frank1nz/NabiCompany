// src/pages/admin/AdminOrders.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Toolbar,
  Stack,
  Typography,
  IconButton,
  Alert,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';

import { adminListOrders, adminUpdateOrderStatus } from '../../lib/orders';

// ========== Theme-ish palette for this page ==========
const BRAND = {
  gold: '#D4AF37',
  goldDark: '#C6A132',
  navy: '#2B4A73',
  creamBg: '#F5F7FB',
  grayStroke: 'rgba(0,0,0,.08)',
  textSoft: 'rgba(0,0,0,.60)',
  chipBg: 'rgba(0,0,0,.05)',
};

// ========== masters ==========
const STATUS = ['pending', 'confirmed', 'rejected', 'fulfilled', 'cancelled'];
const PAY = ['pending', 'paid', 'failed', 'expired'];

// ========== helpers ==========
const money = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Badge = ({ label, color, bg }) => (
  <Chip
    size="small"
    label={label}
    sx={{
      color,
      bgcolor: bg,
      textTransform: 'capitalize',
      fontWeight: 700,
      height: 22,
      '& .MuiChip-label': { px: 1.15, pt: '1px' },
    }}
  />
);

const statusChip = (s) => {
  if (s === 'pending') return <Badge label="pending" color="#8a6d3b" bg="rgba(212,175,55,.12)" />;
  if (s === 'confirmed') return <Badge label="confirmed" color="#0b3d0b" bg="rgba(76,175,80,.18)" />;
  if (s === 'rejected') return <Badge label="rejected" color="#b71c1c" bg="rgba(244,67,54,.15)" />;
  if (s === 'fulfilled') return <Badge label="fulfilled" color="#0d47a1" bg="rgba(33,150,243,.15)" />;
  if (s === 'cancelled') return <Badge label="cancelled" color="#424242" bg="rgba(0,0,0,.08)" />;
  return <Badge label={s || '-'} color="inherit" bg="rgba(0,0,0,.06)" />;
};

const payChip = (s) => {
  if (s === 'pending') return <Badge label="pending" color="#8a6d3b" bg="rgba(212,175,55,.12)" />;
  if (s === 'paid') return <Badge label="paid" color="#0b3d0b" bg="rgba(76,175,80,.18)" />;
  if (s === 'failed') return <Badge label="failed" color="#b71c1c" bg="rgba(244,67,54,.15)" />;
  if (s === 'expired') return <Badge label="expired" color="#424242" bg="rgba(0,0,0,.08)" />;
  return <Badge label={s || '-'} color="inherit" bg="rgba(0,0,0,.06)" />;
};

// รองรับ API หลายเวอร์ชัน — ดึง note จากหลาย ๆ key
const getNote = (o) => {
  const cands = [o?.note, o?.customerNote, o?.userNote, o?.meta?.customerNote, o?.payment?.note];
  return cands.find((v) => typeof v === 'string' && v.trim())?.trim() || '';
};
const getId = (o) => o?.id || o?._id;

// พรีวิวรายการสินค้า: โชว์ 2 รายการแรกเป็นชิป, ที่เหลือรวมเป็น +N พร้อม tooltip
function ProductPreview({ order }) {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (!items.length) {
    return <Typography variant="body2" color="text.secondary">—</Typography>;
  }

  const pills = items.slice(0, 2).map((it, idx) => {
    const name = it.product?.name || it.name || 'สินค้า';
    const qty = Number(it.quantity || 0);
    return (
      <Chip
        key={`${name}-${idx}`}
        size="small"
        label={`${name} × ${qty}`}
        sx={{
          height: 22,
          bgcolor: BRAND.chipBg,
          color: 'rgba(0,0,0,.85)',
          borderRadius: 999,
          '& .MuiChip-label': { px: 1, pt: '1px' },
        }}
      />
    );
  });

  if (items.length <= 2) {
    return (
      <Stack direction="row" spacing={0.75} flexWrap="wrap">
        {pills}
      </Stack>
    );
  }

  const hidden = items.slice(2);
  const hiddenText = hidden
    .map((it) => `${it.product?.name || it.name || 'สินค้า'} × ${it.quantity || 0}`)
    .join('\n');

  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap">
      {pills}
      <Tooltip
        title={<pre style={{ margin: 0, fontFamily: 'ui-monospace, monospace' }}>{hiddenText}</pre>}
        arrow
      >
        <Chip
          size="small"
          label={`+${hidden.length}`}
          sx={{
            height: 22,
            bgcolor: BRAND.chipBg,
            color: 'rgba(0,0,0,.85)',
            borderRadius: 999,
            '& .MuiChip-label': { px: 1, pt: '1px' },
          }}
        />
      </Tooltip>
    </Stack>
  );
}

export default function AdminOrders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState('');
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');

  // filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [pay, setPay] = useState('all');

  // drafts (บันทึกเฉพาะแถวที่แก้)
  const [statusDraft, setStatusDraft] = useState({});
  const [payDraft, setPayDraft] = useState({});

  async function load() {
    setOk('');
    setErr('');
    setLoading(true);
    try {
      const res = (await adminListOrders?.({ status, pay, q, page: 1, limit: 200 })) ?? [];
      const list = Array.isArray(res) ? res : Array.isArray(res?.rows) ? res.rows : [];
      setRows(list);
    } catch (e) {
      setErr(e?.response?.data?.message || 'โหลดคำสั่งซื้อไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); // on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // debounce filter input
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, pay]);

  const data = useMemo(() => rows, [rows]);

  const canSave = (o) => {
    const id = getId(o);
    const ns = statusDraft[id] ?? o.status;
    const np = payDraft[id] ?? o.payment?.status ?? 'pending';
    return ns !== o.status || np !== (o.payment?.status ?? 'pending');
  };

  async function handleSave(o) {
    const id = getId(o);
    setSaving(id);
    setOk('');
    setErr('');
    try {
      const ns = statusDraft[id] ?? o.status;
      const np = payDraft[id] ?? o.payment?.status ?? 'pending';
      const body = {};
      if (ns !== o.status) body.status = ns;
      if (np !== (o.payment?.status ?? 'pending')) body.paymentStatus = np;

      if (!Object.keys(body).length) {
        setSaving('');
        return;
      }

      await adminUpdateOrderStatus(id, body);
      setOk(`บันทึกเรียบร้อย (#${id})`);
      await load();
      setStatusDraft((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      setPayDraft((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
    } catch (e) {
      setErr(e?.response?.data?.message || 'อัปเดตไม่ได้');
    } finally {
      setSaving('');
    }
  }

  return (
    <Container maxWidth={false} sx={{ py: 2, px: { xs: 1.5, md: 3 } }}>
      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'visible', // สำคัญมาก: ไม่ตัด dropdown
          bgcolor: '#fff',
          border: `1px solid ${BRAND.grayStroke}`,
          boxShadow: '0 6px 18px rgba(0,0,0,.04)',
        }}
      >
        {/* Header / Filters */}
        <Toolbar
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 3,
            px: 2,
            py: 1.1,
            gap: 1,
            borderBottom: `1px solid ${BRAND.grayStroke}`,
            bgcolor: BRAND.creamBg,
          }}
        >
          <Typography variant="h6" fontWeight={900} sx={{ color: BRAND.navy, mr: 1 }}>
            รายการคำสั่งซื้อ
          </Typography>

          <TextField
            size="small"
            placeholder="ค้นหา: ชื่อ / อีเมล / ออเดอร์ "
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 420, bgcolor: '#fff', borderRadius: 2 }}
          />

          <Select
            size="small"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            IconComponent={ArrowDropDownRoundedIcon}
            sx={{ ml: 1, bgcolor: '#fff', borderRadius: 2 }}
            MenuProps={{ PaperProps: { style: { maxHeight: 320, zIndex: 2000 } } }}
          >
            <MenuItem value="all">ทุกสถานะ</MenuItem>
            {STATUS.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                {s}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            IconComponent={ArrowDropDownRoundedIcon}
            sx={{ ml: 1, bgcolor: '#fff', borderRadius: 2 }}
            MenuProps={{ PaperProps: { style: { maxHeight: 320, zIndex: 2000 } } }}
          >
            <MenuItem value="all">ทุก payments</MenuItem>
            {PAY.map((s) => (
              <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                {s}
              </MenuItem>
            ))}
          </Select>

          <IconButton onClick={load} title="รีเฟรช" sx={{ ml: 'auto' }}>
            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Toolbar>

        <Box sx={{ px: 2, pt: 2 }}>
          {!!ok && <Alert severity="success" sx={{ mb: 1 }}>{ok}</Alert>}
          {!!err && <Alert severity="error" sx={{ mb: 1 }}>{err}</Alert>}
        </Box>

        {/* Table */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Table
            size="small"
            sx={{
              tableLayout: 'auto',
              minWidth: 1040, // พอดีกับจอทั่วไป
              '& td, & th': { borderColor: BRAND.grayStroke, py: 1.05 },
              // บีบคอลัมน์สินค้าไม่ให้ยืดเกินไป
              '& td:nth-of-type(2), & th:nth-of-type(2)': { maxWidth: 320 },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: BRAND.navy, width: '26%' }}>รายละเอียด</TableCell>
                <TableCell sx={{ fontWeight: 800, color: BRAND.navy, width: '22%' }}>สินค้า</TableCell>
                <TableCell sx={{ fontWeight: 800, color: BRAND.navy, width: '20%' }} align="right">
                  ยอดรวม
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: BRAND.navy, width: '16%' }}>สถานะ</TableCell>
                <TableCell sx={{ fontWeight: 800, color: BRAND.navy, width: '16%' }}>การชำระเงิน</TableCell>
                <TableCell sx={{ fontWeight: 800, color: BRAND.navy, width: '10%' }} align="right">
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((o) => {
                const id = getId(o);
                const created = o.createdAt ? new Date(o.createdAt).toLocaleString() : '-';
                const st = statusDraft[id] ?? o.status;
                const pst = payDraft[id] ?? o.payment?.status ?? 'pending';
                const changed = canSave(o);
                const note = getNote(o);

                return (
                  <TableRow
                    key={id}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,.015)' },
                      '&:hover': { backgroundColor: 'rgba(0,0,0,.03)' },
                      transition: 'background .15s',
                    }}
                  >
                    {/* รายละเอียด */}
                    <TableCell sx={{ verticalAlign: 'top', pr: 2, wordBreak: 'break-word' }}>
                      <Stack spacing={0.25}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 800, fontFamily: 'ui-monospace,monospace' }}
                        >
                          {id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {created}
                        </Typography>
                        <Typography variant="body2">{o.user?.name || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {o.user?.email || '-'}
                        </Typography>
                        {!!note && (
                          <Typography variant="caption" sx={{ color: BRAND.textSoft, mt: 0.25 }}>
                            หมายเหตุ: {note}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* สินค้า */}
                    <TableCell sx={{ verticalAlign: 'top', pr: 2, wordBreak: 'break-word' }}>
                      <ProductPreview order={o} />
                    </TableCell>

                    {/* ยอดรวม */}
                    <TableCell align="right" sx={{ verticalAlign: 'top', pr: 2 }}>
                      <Typography variant="subtitle1" fontWeight={900}>
                        ฿ {money(o.total)}
                      </Typography>
                    </TableCell>

                    {/* สถานะ */}
                    <TableCell sx={{ verticalAlign: 'top', pr: 2 }}>
                      <Stack spacing={0.75}>
                        {statusChip(st)}
                        <Select
                          size="small"
                          value={st}
                          onChange={(e) => setStatusDraft((p) => ({ ...p, [id]: e.target.value }))}
                          IconComponent={ArrowDropDownRoundedIcon}
                          MenuProps={{
                            PaperProps: { style: { maxHeight: 320, zIndex: 2000 } }, // ยิงพอร์ทัล
                          }}
                          sx={{
                            borderRadius: 999,
                            height: 32,
                            minWidth: 160,
                            bgcolor: '#fff',
                            '& .MuiSelect-select': { py: 0.5, fontWeight: 700, textTransform: 'capitalize' },
                          }}
                        >
                          {STATUS.map((s) => (
                            <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                              {s}
                            </MenuItem>
                          ))}
                        </Select>
                      </Stack>
                    </TableCell>

                    {/* การชำระเงิน */}
                    <TableCell sx={{ verticalAlign: 'top', pr: 2 }}>
                      <Stack spacing={0.75}>
                        {payChip(pst)}
                        <Select
                          size="small"
                          value={pst}
                          onChange={(e) => setPayDraft((p) => ({ ...p, [id]: e.target.value }))}
                          IconComponent={ArrowDropDownRoundedIcon}
                          MenuProps={{
                            PaperProps: { style: { maxHeight: 320, zIndex: 2000 } },
                          }}
                          sx={{
                            borderRadius: 999,
                            height: 32,
                            minWidth: 160,
                            bgcolor: '#fff',
                            '& .MuiSelect-select': { py: 0.5, fontWeight: 700, textTransform: 'capitalize' },
                          }}
                        >
                          {PAY.map((s) => (
                            <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                              {s}
                            </MenuItem>
                          ))}
                        </Select>
                        <Typography variant="caption" color="text.secondary">
                          ช่องทาง: {o.payment?.method || '—'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* จัดการ */}
                    <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                      <Button
                        size="small"
                        startIcon={<SaveRoundedIcon />}
                        onClick={() => handleSave(o)}
                        disabled={!changed || saving === id}
                        variant={changed ? 'contained' : 'outlined'}
                        sx={{
                          borderRadius: 999,
                          textTransform: 'none',
                          fontWeight: 800,
                          px: 1.4,
                          minWidth: 0,
                          bgcolor: changed ? BRAND.gold : 'transparent',
                          color: changed ? '#111' : 'inherit',
                          borderColor: 'rgba(0,0,0,.18)',
                          '&:hover': changed ? { bgcolor: BRAND.goldDark } : {},
                        }}
                      >
                        {saving === id ? 'บันทึก…' : 'บันทึก'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!data.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">ไม่พบรายการ</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Container>
  );
}
