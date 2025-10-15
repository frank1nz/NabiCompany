// src/pages/Orders.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Paper, Typography, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Button, Box, Chip, Alert, IconButton, Tooltip, Divider, Skeleton
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { fetchMyOrders, createLineOrder } from '../lib/orders';
import { fetchPublicProducts } from '../lib/products';
import { useAuth } from '../store/authStore';

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canOrder = user?.canOrderViaLine || user?.isVerified || user?.kycStatus === 'approved';

  const loadAll = async () => {
    setError('');
    setSuccess('');
    setLoadingList(true);
    setLoadingProducts(true);
    try {
      const [o, p] = await Promise.all([
        fetchMyOrders().catch(() => []),
        fetchPublicProducts({ status: 'active' }).catch(() => []),
      ]);
      setOrders(o || []);
      setProducts(p || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoadingList(false);
      setLoadingProducts(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const totalPreview = useMemo(() => {
    return products.reduce((acc, product) => {
      const qty = Number(quantities[product._id] || 0);
      if (!qty) return acc;
      return acc + (product.price || 0) * qty;
    }, 0);
  }, [products, quantities]);

  const resetForm = () => {
    setQuantities({});
    setNote('');
  };

  const addQty = (id, step = 1) =>
    setQuantities((prev) => {
      const next = Math.max(0, Number(prev[id] || 0) + step);
      return { ...prev, [id]: next || '' };
    });

  const setQty = (id, val) =>
    setQuantities((prev) => {
      const n = Math.max(0, Number(val || 0));
      return { ...prev, [id]: n || '' };
    });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!canOrder) {
      setError('บัญชียังไม่ผ่านการยืนยัน ไม่สามารถสั่งซื้อได้');
      return;
    }

    const items = Object.entries(quantities)
      .map(([productId, quantity]) => ({ productId, quantity: Number(quantity) }))
      .filter((item) => item.quantity > 0);

    if (!items.length) {
      setError('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    // แนะนำให้กรอก LINE ID ถ้ายังไม่มีในโปรไฟล์
    const lineId = user?.profile?.lineId || user?.lineId || '';
    if (!lineId) {
      setError('กรุณาระบุ LINE ID ในโปรไฟล์ก่อนสั่งซื้อ');
      return;
    }

    setLoading(true);
    try {
      await createLineOrder({ items, note, lineUserId: lineId });
      setSuccess('ส่งคำสั่งซื้อเรียบร้อย! ทีมงานจะยืนยันผ่าน LINE');
      resetForm();
      const latest = await fetchMyOrders();
      setOrders(latest || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'ไม่สามารถสร้างคำสั่งซื้อได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack spacing={3}>
      {/* ฟอร์มสั่งซื้อ */}
      <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h6" fontWeight={900}>สร้างคำสั่งซื้อผ่าน LINE</Typography>
          <Tooltip title="รีเฟรช">
            <IconButton onClick={loadAll} size="small"><RefreshRoundedIcon /></IconButton>
          </Tooltip>
        </Stack>

        {!canOrder && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ต้องผ่าน KYC ก่อนจึงจะสามารถสั่งซื้อได้
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={700}>เลือกรายการสินค้า</Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>สินค้า</TableCell>
                <TableCell align="right">ราคา (฿)</TableCell>
                <TableCell width={220}>จำนวน</TableCell>
                <TableCell align="right">รวม (฿)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingProducts && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <TableRow key={`s-${i}`}>
                      <TableCell><Skeleton width={180} /></TableCell>
                      <TableCell align="right"><Skeleton width={80} /></TableCell>
                      <TableCell><Skeleton width={160} /></TableCell>
                      <TableCell align="right"><Skeleton width={100} /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {!loadingProducts && products.map((product) => {
                const qty = Number(quantities[product._id] || 0);
                const lineTotal = (product.price || 0) * (qty || 0);
                return (
                  <TableRow key={product._id}>
                    <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                    <TableCell align="right">{fmtMoney(product.price)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => addQty(product._id, -1)}
                          disabled={loading || qty <= 0}
                          aria-label="ลดจำนวน"
                        >
                          <RemoveRoundedIcon />
                        </IconButton>
                        <TextField
                          type="number"
                          size="small"
                          value={quantities[product._id] ?? ''}
                          onChange={(e) => setQty(product._id, e.target.value)}
                          inputProps={{ min: 0 }}
                          sx={{ width: 90 }}
                          disabled={loading}
                        />
                        <IconButton
                          size="small"
                          onClick={() => addQty(product._id, 1)}
                          disabled={loading}
                          aria-label="เพิ่มจำนวน"
                        >
                          <AddRoundedIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{fmtMoney(lineTotal)}</TableCell>
                  </TableRow>
                );
              })}

              {!loadingProducts && products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" style={{ opacity: 0.7 }}>
                    ยังไม่มีสินค้าเปิดขาย
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TextField
            label="หมายเหตุถึงทีมงาน"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={3}
            placeholder="ระบุรายละเอียดเพิ่มเติม เช่น เวลาที่สะดวก, คำขอจัดส่ง, ฯลฯ"
            disabled={loading}
          />

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight={800}>
              ยอดโดยประมาณ: ฿ {fmtMoney(totalPreview)}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={resetForm}
                disabled={loading}
              >
                ล้างรายการ
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !canOrder}
              >
                {loading ? 'กำลังส่ง...' : 'ส่งคำสั่งซื้อ'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ประวัติคำสั่งซื้อ */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={900} mb={2}>ประวัติคำสั่งซื้อ</Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>รหัส</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell align="right">ยอดรวม</TableCell>
              <TableCell align="right">จำนวนสินค้า</TableCell>
              <TableCell>อัปเดตล่าสุด</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingList && (
              <>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={`ol-${i}`}>
                    <TableCell><Skeleton width={120} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell align="right"><Skeleton width={80} /></TableCell>
                    <TableCell align="right"><Skeleton width={60} /></TableCell>
                    <TableCell><Skeleton width={160} /></TableCell>
                  </TableRow>
                ))}
              </>
            )}

            {!loadingList && orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell sx={{ fontFamily: 'ui-monospace, monospace' }}>{order.id}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    size="small"
                    color={
                      order.status === 'confirmed' ? 'success' :
                      order.status === 'rejected'  ? 'error'   :
                      order.status === 'fulfilled' ? 'primary' :
                      order.status === 'cancelled' ? 'default' :
                      'warning'
                    }
                    variant={order.status === 'pending' ? 'outlined' : 'filled'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell align="right">฿ {Number(order.total || 0).toLocaleString()}</TableCell>
                <TableCell align="right">
                  {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </TableCell>
                <TableCell>
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}
                </TableCell>
              </TableRow>
            ))}

            {!loadingList && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" style={{ opacity: 0.7 }}>
                  ยังไม่มีคำสั่งซื้อ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
