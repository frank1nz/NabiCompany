// frontend/src/pages/admin/AdminOrders.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Paper, Box, Toolbar, Stack, Typography, IconButton, Alert,
  Select, MenuItem, TextField, InputAdornment, CircularProgress, Chip, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import { adminListOrders, adminUpdateOrderStatus } from '../../lib/orders';

const BRAND = { navy: '#1C2738', gold: '#D4AF37', green: '#1e8e3e' };
const STATUS = ['pending','confirmed','rejected','fulfilled','cancelled'];
const PAY    = ['pending','paid','failed','expired'];

const Pill = ({label, color, bg}) => (
  <Chip
    size="small"
    label={label}
    sx={{
      color, bgcolor:bg, fontWeight: 800, textTransform:'capitalize',
      height: 24, '& .MuiChip-label': { px: 1.2, pt: '1px' }
    }}
  />
);

const statusPill = (s)=>{
  if (s==='pending')   return <Pill label="Pending"   color="#8a6d3b" bg="rgba(212,175,55,.12)" />;
  if (s==='confirmed') return <Pill label="Confirmed" color="#0b3d0b" bg="rgba(76,175,80,.18)"  />;
  if (s==='rejected')  return <Pill label="Rejected"  color="#b71c1c" bg="rgba(244,67,54,.15)"  />;
  if (s==='fulfilled') return <Pill label="Fulfilled" color="#0d47a1" bg="rgba(33,150,243,.15)" />;
  if (s==='cancelled') return <Pill label="Cancelled" color="#424242" bg="rgba(0,0,0,.08)"      />;
  return <Pill label={s||'-'} color="inherit" bg="rgba(0,0,0,.06)" />;
};

const payPill = (s)=>{
  if (s==='pending')  return <Pill label="Pending" color="#8a6d3b" bg="rgba(212,175,55,.12)" />;
  if (s==='paid')     return <Pill label="Paid"    color="#0b3d0b" bg="rgba(76,175,80,.18)"  />;
  if (s==='failed')   return <Pill label="Failed"  color="#b71c1c" bg="rgba(244,67,54,.15)"  />;
  if (s==='expired')  return <Pill label="Expired" color="#424242" bg="rgba(0,0,0,.08)"      />;
  return <Pill label={s||'-'} color="inherit" bg="rgba(0,0,0,.06)" />;
};

const money = (n)=>Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});

// ดึง note ลูกค้าจากหลาย key
const getNote = (o)=>{
  const cands = [o?.note, o?.customerNote, o?.userNote, o?.meta?.customerNote, o?.payment?.note];
  return cands.find(v=> typeof v==='string' && v.trim())?.trim() || '';
};

export default function AdminOrders(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState('');
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');

  // filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [pay, setPay] = useState('all');

  // drafts
  const [statusDraft, setStatusDraft] = useState({});
  const [payDraft, setPayDraft] = useState({});

  // dialog
  const [view, setView] = useState(null);

  async function load(){
    setOk(''); setErr(''); setLoading(true);
    try{
      const res = await adminListOrders?.({ status, pay, q, page:1, limit:200 }) ?? [];
      const list = Array.isArray(res) ? res : (Array.isArray(res?.rows) ? res.rows : []);
      setRows(list);
    }catch(e){
      setErr(e?.response?.data?.message || 'โหลดคำสั่งซื้อไม่สำเร็จ');
    }finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */ },[]);
  useEffect(()=>{ const t=setTimeout(load, 180); return ()=>clearTimeout(t); },[q,status,pay]);

  const data = useMemo(()=>rows,[rows]);
  const getId = (o)=>o?.id || o?._id;
  const canSave = (o)=>{
    const id = getId(o);
    const ns = statusDraft[id] ?? o.status;
    const np = payDraft[id]    ?? o.payment?.status ?? 'pending';
    return ns !== o.status || np !== (o.payment?.status ?? 'pending');
  };

  async function handleSave(o){
    const id = getId(o);
    setSaving(id); setOk(''); setErr('');
    try{
      const ns = statusDraft[id] ?? o.status;
      const np = payDraft[id]    ?? o.payment?.status ?? 'pending';
      const body = {};
      if (ns !== o.status) body.status = ns;
      if (np !== (o.payment?.status ?? 'pending')) body.paymentStatus = np;
      if (!Object.keys(body).length){ setSaving(''); return; }
      await adminUpdateOrderStatus(id, body);
      setOk(`บันทึกเรียบร้อย (#${id})`);
      await load();
      setStatusDraft(p=>{ const n={...p}; delete n[id]; return n; });
      setPayDraft(p=>{ const n={...p}; delete n[id]; return n; });
    }catch(e){
      setErr(e?.response?.data?.message || 'อัปเดตไม่ได้');
    }finally{ setSaving(''); }
  }

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {/* HEADER */}
      <Toolbar sx={{ px: 2, py: 1, gap: 1.25, borderBottom:'1px solid rgba(0,0,0,.06)', bgcolor:'#fafafb' }}>
        <Typography variant="h6" fontWeight={900} sx={{ color: BRAND.navy, mr: 1 }}>
          รายการคำสั่งซื้อ
        </Typography>

        <TextField
          size="small" placeholder="ค้นหา: ชื่อ / อีเมล / ออเดอร์ / REF"
          value={q} onChange={(e)=>setQ(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>
          }}
          sx={{ minWidth: 320 }}
        />

        <Select size="small" value={status} onChange={(e)=>setStatus(e.target.value)}>
          <MenuItem value="all">ทุกสถานะ</MenuItem>
          {STATUS.map(s=> <MenuItem key={s} value={s} sx={{ textTransform:'capitalize' }}>{s}</MenuItem>)}
        </Select>
        <Select size="small" value={pay} onChange={(e)=>setPay(e.target.value)}>
          <MenuItem value="all">ทุก payments</MenuItem>
          {PAY.map(s=> <MenuItem key={s} value={s} sx={{ textTransform:'capitalize' }}>{s}</MenuItem>)}
        </Select>

        <IconButton onClick={load} title="รีเฟรช" sx={{ ml: 'auto' }}>
          {loading ? <CircularProgress size={20}/> : <RefreshIcon/>}
        </IconButton>
      </Toolbar>

      <Box sx={{ px: 2, pt: 2 }}>
        {!!ok &&  <Alert severity="success" sx={{ mb: 1 }}>{ok}</Alert>}
        {!!err && <Alert severity="error"   sx={{ mb: 1 }}>{err}</Alert>}
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Table size="small" sx={{ tableLayout:'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight:700, color:BRAND.navy, width:'32%' }}>รายละเอียด</TableCell>
              <TableCell sx={{ fontWeight:700, color:BRAND.navy, width:'12%' }}>ยอดรวม</TableCell>
              <TableCell sx={{ fontWeight:700, color:BRAND.navy, width:'20%' }}>สถานะ</TableCell>
              <TableCell sx={{ fontWeight:700, color:BRAND.navy, width:'20%' }}>การชำระเงิน</TableCell>
              <TableCell sx={{ fontWeight:700, color:BRAND.navy, width:'10%' }}>REF</TableCell>
              <TableCell sx={{ fontWeight:700, color:BRAND.navy }} align="right">จัดการ</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map(o=>{
              const id   = getId(o);
              const when = o.createdAt ? new Date(o.createdAt).toLocaleString() : '-';
              const st   = statusDraft[id] ?? o.status;
              const pst  = payDraft[id]    ?? o.payment?.status ?? 'pending';
              const note = getNote(o);
              const changed = canSave(o);

              return (
                <TableRow key={id} hover sx={{ '&:hover': { bgcolor:'rgba(0,0,0,.02)' } }}>
                  {/* รายละเอียด */}
                  <TableCell sx={{ verticalAlign:'top', pr: 2 }}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Typography variant="body2" sx={{ fontFamily:'ui-monospace,monospace', fontWeight:800 }}>
                          {id}
                        </Typography>
                        {note && (
                          <IconButton size="small" title="หมายเหตุจากลูกค้า" onClick={()=>setView(o)} sx={{ p: .25 }}>
                            <NotesRoundedIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{when}</Typography>
                      <Typography variant="body2">{o.user?.name || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">{o.user?.email || '-'}</Typography>
                    </Stack>
                  </TableCell>

                  {/* ยอดรวม */}
                  <TableCell sx={{ verticalAlign:'top' }}>
                    <Typography variant="subtitle1" fontWeight={900}>฿ {money(o.total)}</Typography>
                  </TableCell>

                  {/* สถานะ: pill อยู่ด้านบน + select ด้านล่าง (แบบในภาพ) */}
                  <TableCell sx={{ verticalAlign:'top' }}>
                    <Stack spacing={0.75}>
                      {statusPill(st)}
                      <Select
                        size="small"
                        value={st}
                        onChange={(e)=>setStatusDraft(p=>({ ...p, [id]: e.target.value }))}
                        sx={{ maxWidth: 220, textTransform:'capitalize' }}
                      >
                        {STATUS.map(s=><MenuItem key={s} value={s} sx={{ textTransform:'capitalize' }}>{s}</MenuItem>)}
                      </Select>
                    </Stack>
                  </TableCell>

                  {/* การชำระเงิน */}
                  <TableCell sx={{ verticalAlign:'top' }}>
                    <Stack spacing={0.75}>
                      {payPill(pst)}
                      <Select
                        size="small"
                        value={pst}
                        onChange={(e)=>setPayDraft(p=>({ ...p, [id]: e.target.value }))}
                        sx={{ maxWidth: 220, textTransform:'capitalize' }}
                      >
                        {PAY.map(s=><MenuItem key={s} value={s} sx={{ textTransform:'capitalize' }}>{s}</MenuItem>)}
                      </Select>
                      <Typography variant="caption" color="text.secondary">
                        ช่องทาง: {o.payment?.method || '—'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* REF + ปุ่ม “ดู” สีเขียวแบบกะทัดรัด (ไม่ทับตัวเลข) */}
                  <TableCell sx={{ verticalAlign:'middle' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                      <Typography
                        noWrap
                        sx={{ maxWidth: 90, overflow:'hidden', textOverflow:'ellipsis', fontFamily:'ui-monospace,monospace' }}
                        title={o.payment?.reference || '-'}
                      >
                        {o.payment?.reference || '-'}
                      </Typography>
                      <Button
                        size="small"
                        onClick={()=>setView(o)}
                        startIcon={<VisibilityRoundedIcon fontSize="small" />}
                        sx={{
                          minWidth: 'fit-content',
                          px: 1.1,
                          py: 0.2,
                          borderRadius: 999,
                          color: BRAND.green,
                          bgcolor: 'rgba(30,142,62,.10)',
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'rgba(30,142,62,.18)' },
                          '& .MuiButton-startIcon': { mr: 0.5 },
                        }}
                      >
                        ดู
                      </Button>
                    </Stack>
                  </TableCell>

                  {/* จัดการ */}
                  <TableCell align="right" sx={{ verticalAlign:'top' }}>
                    <Button
                      size="small"
                      variant={changed ? 'contained' : 'outlined'}
                      startIcon={<SaveRoundedIcon />}
                      disabled={!changed || saving===id}
                      onClick={()=>handleSave(o)}
                      sx={{
                        bgcolor: changed ? BRAND.gold : 'transparent',
                        color: changed ? '#111' : 'inherit',
                        borderRadius: 999,
                        px: 2,
                        fontWeight: 800,
                        '&:hover': changed ? { bgcolor: '#C6A132' } : {},
                      }}
                    >
                      {saving===id ? 'บันทึก…' : 'บันทึก'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {!data.length && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  ไม่พบรายการ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Dialog: รายละเอียด + note ลูกค้า */}
      <Dialog open={!!view} onClose={()=>setView(null)} maxWidth="sm" fullWidth>
        <DialogTitle>รายละเอียดคำสั่งซื้อ</DialogTitle>
        <DialogContent dividers>
          {view && (
            <Stack spacing={1.2}>
              <Typography variant="body2" sx={{ fontFamily:'ui-monospace,monospace' }}>
                {getId(view)}
              </Typography>
              <Typography variant="body2">
                ผู้สั่งซื้อ: {view.user?.name || '-'} ({view.user?.email || '-'})
              </Typography>
              <Typography variant="body2">ยอดรวม: ฿ {money(view.total)}</Typography>
              <Typography variant="body2">
                ช่องทาง: {view.payment?.method || '—'} • REF: {view.payment?.reference || '—'}
              </Typography>
              {!!getNote(view) && (
                <Box sx={{ mt:.5, p:1, borderRadius:1, bgcolor:'rgba(28,39,56,.04)', border:'1px solid rgba(28,39,56,.08)' }}>
                  <Typography variant="caption" color="text.secondary">หมายเหตุจากลูกค้า</Typography>
                  <Typography variant="body2" sx={{ whiteSpace:'pre-wrap' }}>{getNote(view)}</Typography>
                </Box>
              )}
              {!!view.shippingAddress && (
                <Box sx={{ mt:.5 }}>
                  <Typography variant="caption" color="text.secondary">ที่อยู่จัดส่ง</Typography>
                  <Typography variant="body2" sx={{ whiteSpace:'pre-wrap' }}>{view.shippingAddress}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setView(null)}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
