// src/pages/Orders.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Paper, Typography, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Button, Box, Chip, Alert, IconButton, Tooltip, Divider, Skeleton,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PromptPayQr from '../components/PromptPayQr';
import { useAuth } from '../store/authStore';
import { useCart } from '../store/cartStore';
import { fetchMyOrders, checkoutCart } from '../lib/orders';

const uploadBase = import.meta.env.VITE_UPLOAD_BASE;
const imgSrc = (path) => (path?.startsWith?.('http') ? path : `${uploadBase}/${path}`);

const moneyFmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtMoney = (n) => moneyFmt.format(Number(n || 0));

const ORDER_STATUS_UI = {
  pending: { color: 'warning', label: 'pending' },
  confirmed: { color: 'success', label: 'confirmed' },
  rejected: { color: 'error', label: 'rejected' },
  fulfilled: { color: 'primary', label: 'fulfilled' },
  cancelled: { color: 'default', label: 'cancelled' }
};

const PAY_STATUS_UI = {
  pending: { color: 'warning', label: 'รอชำระ' },
  paid: { color: 'success', label: 'ชำระแล้ว' },
  failed: { color: 'error', label: 'ชำระไม่สำเร็จ' },
  expired: { color: 'default', label: 'หมดอายุ' }
};

const chipOf = (status, map) => {
  const s = map[status] || { color: 'default', label: status || 'unknown' };
  return (
    <Chip
      size="small"
      label={s.label}
      color={s.color}
      variant={status === 'pending' ? 'outlined' : 'filled'}
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

const getProductKey = (item) => item.productId || item.product?._id || item.product?.id || item.product;

/* -------------------------------------------------------------------------- */

export default function Orders() {
  const { user } = useAuth();

  // cart store
  const cartItems   = useCart((s) => s.items);
  const totals      = useCart((s) => s.totals);
  const cartLoading = useCart((s) => s.loading);
  const cartError   = useCart((s) => s.error);

  const loadCart    = useCart((s) => s.loadCart);
  const updateItem  = useCart((s) => s.updateItem);
  const removeItem  = useCart((s) => s.removeItem);
  const clearCart   = useCart((s) => s.clear);
  const setCart     = useCart((s) => s.setCart);

  // orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // form
  const [shippingAddress, setShippingAddress] = useState(user?.profile?.address || '');
  const [note, setNote] = useState('');

  // UI
  const [quantities, setQuantities] = useState({});
  const [mutatingId, setMutatingId] = useState('');
  const [clearing, setClearing] = useState(false);
  const [cartMsg, setCartMsg] = useState({ type: '', text: '' });

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');
  const [paymentOrder, setPaymentOrder] = useState(null);

  // copy fallback
  const handleCopy = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCheckoutSuccess('คัดลอกข้อมูลเรียบร้อย');
    } catch {
      setCheckoutError('คัดลอกข้อมูลไม่สำเร็จ');
    }
  };

  // debounce for quantity typing
  const debounceRef = useRef({});
  const debounce = (key, fn, wait = 400) => {
    clearTimeout(debounceRef.current[key]);
    debounceRef.current[key] = setTimeout(fn, wait);
  };

  /* ---------------------------- initial & refresh --------------------------- */

  useEffect(() => { setShippingAddress(user?.profile?.address || ''); }, [user?.profile?.address]);

  useEffect(() => {
    const next = {};
    for (const it of cartItems) {
      const k = getProductKey(it);
      if (k) next[k] = it.quantity;
    }
    setQuantities(next);
  }, [cartItems]);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadCart().catch(() => null), loadOrders()]);
      } catch {/* noop */}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    setOrdersError(''); setOrdersLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrdersError(err?.response?.data?.message || 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ');
    } finally { setOrdersLoading(false); }
  };

  const refreshAll = async () => {
    setCartMsg({ type:'', text:'' }); setCheckoutError(''); setCheckoutSuccess('');
    try { await Promise.all([loadCart().catch(()=>null), loadOrders()]); } catch {}
  };

  /* --------------------------- quantity operations -------------------------- */

  const handleQuantityInput = (pid, val) => {
    setQuantities((p) => ({ ...p, [pid]: val }));
  };

  const commitQty = async (item) => {
    const pid = getProductKey(item);
    if (!pid) return;

    const raw = String(quantities[pid] ?? '').trim();
    const parsed = Number(raw.replace(/[^\d]/g, ''));
    let nextQty = Number.isFinite(parsed) ? parsed : item.quantity;

    if (nextQty <= 0) return await handleRemove(item);

    const stock = Number(item.product?.stock ?? item.availableStock ?? Number.POSITIVE_INFINITY);
    if (Number.isFinite(stock)) nextQty = Math.min(nextQty, Math.max(0, stock));

    if (nextQty === item.quantity) {
      setQuantities((p) => ({ ...p, [pid]: item.quantity }));
      return;
    }

    setMutatingId(pid); setCartMsg({ type:'', text:'' });
    try {
      const data = await updateItem(pid, nextQty);
      if (data?.notice) setCartMsg({ type:'warning', text:data.notice });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'อัปเดตจำนวนไม่สำเร็จ';
      setCartMsg({ type:'error', text:msg });
      setQuantities((p) => ({ ...p, [pid]: item.quantity }));
    } finally { setMutatingId(''); }
  };

  const handleIncrement = async (item) => {
    const pid = getProductKey(item); if (!pid) return;
    setMutatingId(pid); setCartMsg({ type:'', text:'' });
    try {
      const stock = Number(item.product?.stock ?? item.availableStock ?? Number.POSITIVE_INFINITY);
      const desired = Number(item.quantity || 0) + 1;
      const reqQty = Number.isFinite(stock) ? Math.min(desired, stock) : desired;
      const data = await updateItem(pid, reqQty);
      if (data?.notice) setCartMsg({ type:'warning', text:data.notice });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'เพิ่มจำนวนไม่สำเร็จ';
      setCartMsg({ type:'error', text:msg });
    } finally { setMutatingId(''); }
  };

  const handleDecrement = async (item) => {
    const pid = getProductKey(item); if (!pid) return;
    const current = Number(item.quantity || 0);
    if (current <= 1) return await handleRemove(item);
    setMutatingId(pid); setCartMsg({ type:'', text:'' });
    try {
      await updateItem(pid, current - 1);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'ลดจำนวนไม่สำเร็จ';
      setCartMsg({ type:'error', text:msg });
    } finally { setMutatingId(''); }
  };

  const handleRemove = async (item) => {
    const pid = getProductKey(item); if (!pid) return;
    setMutatingId(pid); setCartMsg({ type:'', text:'' });
    try { await removeItem(pid); }
    catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'นำสินค้าออกไม่สำเร็จ';
      setCartMsg({ type:'error', text:msg });
    } finally { setMutatingId(''); }
  };

  const handleClearCart = async () => {
    setCartMsg({ type:'', text:'' }); setClearing(true);
    try { await clearCart(); setCheckoutSuccess(''); setCheckoutError(''); }
    catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'ไม่สามารถล้างตะกร้าได้';
      setCartMsg({ type:'error', text:msg });
    } finally { setClearing(false); }
  };

  /* -------------------------------- checkout -------------------------------- */

  const handleCheckout = async () => {
    const address = (shippingAddress || '').trim();
    if (!address) { setCheckoutError('กรุณากรอกที่อยู่จัดส่ง'); return; }

    setCheckoutLoading(true);
    setCheckoutError(''); setCheckoutSuccess(''); setCartMsg({ type:'', text:'' });

    try {
      const data = await checkoutCart({ note, shippingAddress: address });
      if (data?.cart) setCart(data.cart); else await loadCart().catch(()=>null);
      setNote('');
      setCheckoutSuccess('สร้างคำสั่งซื้อสำเร็จ กรุณาชำระเงินผ่าน PromptPay');
      setPaymentOrder(data?.order || null);
      await loadOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'ไม่สามารถทำรายการได้';
      setCheckoutError(msg);
      if (err?.response?.data?.cart) {
        setCart(err.response.data.cart);
        setCartMsg({ type:'warning', text: msg });
      }
    } finally { setCheckoutLoading(false); }
  };

  /* ------------------------------- derived flags ----------------------------- */

  const cartEmpty = !cartLoading && cartItems.length === 0;
  const totalsDisplay = useMemo(() => ({
    amount: fmtMoney(totals.amount || 0),
    quantity: Number(totals.quantity || 0)
  }), [totals.amount, totals.quantity]);

  const addressOk = Boolean((shippingAddress || '').trim());
  const canCheckout = !checkoutLoading && !cartEmpty && addressOk;

  /* ----------------------------- payment dialog FX --------------------------- */

  const paymentDialogOpen = Boolean(paymentOrder);
  const paymentInfo = paymentOrder?.payment || {};
  const expiresAt = paymentInfo?.expiresAt ? new Date(paymentInfo.expiresAt) : null;
  const paidAt = paymentInfo?.paidAt ? new Date(paymentInfo.paidAt) : null;
  const closePaymentDialog = () => setPaymentOrder(null);

  // polling payment status while dialog open (2 minutes, every 5s)
  useEffect(() => {
    if (!paymentDialogOpen || !paymentOrder?.id) return;
    let tries = 0, timer;
    const tick = async () => {
      try { await loadOrders(); tries += 1; }
      catch {}
      if (tries < 24) timer = setTimeout(tick, 5000);
    };
    timer = setTimeout(tick, 5000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentDialogOpen, paymentOrder?.id]);

  /* ---------------------------------- render -------------------------------- */

  return (
    <Stack spacing={3}>
      {/* ------------------------------- CART CARD ------------------------------ */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={900}>ตะกร้าสินค้า</Typography>
          <Tooltip title="รีเฟรช">
            <span>
              <IconButton onClick={refreshAll} disabled={cartLoading || ordersLoading || checkoutLoading}>
                <RefreshRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {cartError && <Alert severity="error" sx={{ mb: 2 }}>{cartError}</Alert>}
        {!!cartMsg.text && (
          <Alert severity={cartMsg.type === 'error' ? 'error' : cartMsg.type === 'warning' ? 'warning' : 'success'} sx={{ mb: 2 }}>
            {cartMsg.text}
          </Alert>
        )}
        {!!checkoutError && <Alert severity="error" sx={{ mb: 2 }}>{checkoutError}</Alert>}
        {!!checkoutSuccess && <Alert severity="success" sx={{ mb: 2 }}>{checkoutSuccess}</Alert>}

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small" stickyHeader sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>สินค้า</TableCell>
                <TableCell align="right">ราคา/ชิ้น</TableCell>
                <TableCell align="center" sx={{ width: 220 }}>จำนวน</TableCell>
                <TableCell align="right">รวม</TableCell>
                <TableCell align="center" sx={{ width: 80 }}>ลบ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {cartLoading && Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={`sk-${i}`}>
                <TableCell><Skeleton width={260} /><Skeleton width={180} /></TableCell>
                <TableCell align="right"><Skeleton width={80} /></TableCell>
                <TableCell align="center"><Skeleton width={120} /></TableCell>
                <TableCell align="right"><Skeleton width={80} /></TableCell>
                <TableCell align="center"><Skeleton width={40} /></TableCell>
              </TableRow>
            ))}

            {!cartLoading && cartItems.map((item) => {
              const pid = getProductKey(item);
              const qty = quantities[pid] ?? item.quantity ?? 0;
              const numericQty = Number(qty) || 0;

              const unitPrice = Number(item.unitPrice || 0);
              const lineTotal = Number(item.lineTotal || unitPrice * (item.quantity || 0));
              const name = item.product?.name || item.name || 'สินค้า';
              const cover = item.product?.images?.[0];

              const stockRaw = Number(item.product?.stock ?? item.availableStock ?? Number.NaN);
              const finite = Number.isFinite(stockRaw);
              const stock = finite ? Math.max(0, stockRaw) : null;
              const out = finite ? stock <= 0 : false;
              const low = finite ? stock > 0 && stock <= 5 : false;

              const maxReached = finite && stock !== null ? numericQty >= stock : false;
              const incDisabled = mutatingId === pid || checkoutLoading || (finite && stock !== null && numericQty >= stock);

              return (
                <TableRow key={pid}>
                  <TableCell>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      {!!cover && (
                        <Box
                          component="img"
                          src={imgSrc(cover)}
                          alt={name}
                          sx={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <Box>
                        <Typography fontWeight={700}>{name}</Typography>
                        {item.product?.sku && (
                          <Typography variant="caption" color="text.secondary">SKU: {item.product.sku}</Typography>
                        )}
                        {finite && (
                          <Typography variant="caption" color={out ? 'error.main' : low ? 'warning.main' : 'text.secondary'} display="block">
                            คงเหลือ {stock} ชิ้น
                          </Typography>
                        )}
                        {maxReached && !out && (
                          <Typography variant="caption" color="warning.main" display="block">
                            ถึงจำนวนสูงสุดตามสต็อกแล้ว
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell align="right">฿ {fmtMoney(unitPrice)}</TableCell>

                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <IconButton size="small" onClick={() => handleDecrement(item)} disabled={mutatingId === pid || checkoutLoading} aria-label="ลดจำนวน">
                        <RemoveRoundedIcon />
                      </IconButton>

                      <TextField
                        value={qty}
                        onChange={(e) => {
                          handleQuantityInput(pid, e.target.value);
                          debounce(pid, () => commitQty(item), 400);
                        }}
                        onBlur={() => commitQty(item)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitQty(item); } }}
                        size="small"
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          min: 0,
                          max: finite && stock !== null ? stock : undefined
                        }}
                        sx={{ width: 90 }}
                      />

                      <IconButton size="small" onClick={() => handleIncrement(item)} disabled={incDisabled} aria-label="เพิ่มจำนวน">
                        <AddRoundedIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#0f5132' }}>
                      ฿ {fmtMoney(lineTotal)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="นำออก">
                      <span>
                        <IconButton color="error" onClick={() => handleRemove(item)} disabled={mutatingId === pid || checkoutLoading}>
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {!cartLoading && cartItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">ยังไม่มีสินค้าในตะกร้า</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={2}>
          <TextField
            label="ที่อยู่จัดส่ง"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
            multiline
            minRows={3}
            placeholder="บ้านเลขที่ / อาคาร / ถนน / แขวง / เขต / จังหวัด / รหัสไปรษณีย์"
            disabled={checkoutLoading}
          />

          <TextField
            label="หมายเหตุถึงทีมงาน (ถ้ามี)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            minRows={2}
            disabled={checkoutLoading}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>รายการทั้งหมด: {totalsDisplay.quantity} ชิ้น</Typography>
              <Typography variant="subtitle1" fontWeight={900}>ยอดรวม: ฿ {totalsDisplay.amount}</Typography>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleClearCart} disabled={cartEmpty || clearing || checkoutLoading}>
                {clearing ? 'กำลังล้าง…' : 'ล้างตะกร้า'}
              </Button>

              <Tooltip title={addressOk ? '' : 'กรุณากรอกที่อยู่จัดส่ง'}>
                <span>
                  <Button variant="contained" onClick={handleCheckout} disabled={!canCheckout} sx={{ fontWeight: 800 }}>
                    {checkoutLoading ? 'กำลังสร้างคำสั่งซื้อ…' : 'ชำระเงิน'}
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* ------------------------------ ORDERS CARD ----------------------------- */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={900} mb={2}>ประวัติคำสั่งซื้อ</Typography>

        {ordersError && <Alert severity="error" sx={{ mb: 2 }}>{ordersError}</Alert>}

        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table size="small" stickyHeader sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>รหัสคำสั่งซื้อ</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell>การชำระเงิน</TableCell>
                <TableCell align="right">ยอดรวม</TableCell>
                <TableCell align="right">จำนวนสินค้า</TableCell>
                <TableCell>อัปเดตล่าสุด</TableCell>
                <TableCell align="right">จัดการ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {ordersLoading && Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={`order-sk-${i}`}>
                <TableCell><Skeleton width={180} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell align="right"><Skeleton width={80} /></TableCell>
                <TableCell align="right"><Skeleton width={40} /></TableCell>
                <TableCell><Skeleton width={160} /></TableCell>
                <TableCell align="right"><Skeleton width={80} /></TableCell>
              </TableRow>
            ))}

            {!ordersLoading && orders.map((order) => {
              const count = order.items?.reduce((s, it) => s + Number(it.quantity || 0), 0) || 0;
              const payStatus = order.payment?.status || 'pending';
              const canPay = payStatus === 'pending';
              return (
                <TableRow key={order.id}>
                  <TableCell sx={{ fontFamily: 'ui-monospace, monospace' }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={700}>{order.id}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        สร้างเมื่อ {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{chipOf(order.status, ORDER_STATUS_UI)}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {chipOf(payStatus, PAY_STATUS_UI)}
                      {order.payment?.reference && (
                        <Typography variant="caption" color="text.secondary">
                          REF: {order.payment.reference}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">฿ {fmtMoney(order.total || 0)}</TableCell>
                  <TableCell align="right">{count}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => setPaymentOrder(order)}>ดูรายละเอียด</Button>
                      {/* {canPay && (
                        <Button size="small" variant="contained" onClick={() => setPaymentOrder(order)} sx={{ fontWeight: 700 }}>
                          ชำระเงิน
                        </Button>
                      )} */}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {!ordersLoading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">ยังไม่มีคำสั่งซื้อ</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </Box>
      </Paper>

      {/* ----------------------------- PAYMENT DIALOG --------------------------- */}
      <Dialog open={paymentDialogOpen} onClose={closePaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={800}>รายละเอียดการชำระเงิน</Typography>
          <IconButton onClick={closePaymentDialog} aria-label="ปิด"><CloseRoundedIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {paymentOrder && (
            <Stack spacing={2}>
              {paymentInfo?.payload ? (
                <PromptPayQr payload={paymentInfo.payload} size={260} label="สแกนเพื่อชำระผ่าน PromptPay" />
              ) : (
                <Alert severity="info">ยังไม่มีรหัส QR ชำระเงิน</Alert>
              )}

              <Box>
                <Typography variant="body2">ยอดชำระ: ฿ {fmtMoney(paymentInfo?.amount || paymentOrder.total || 0)}</Typography>

                {paymentInfo?.reference && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">รหัสอ้างอิง: {paymentInfo.reference}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(paymentInfo.reference)} aria-label="คัดลอกหมายเลขอ้างอิง">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}

                {paymentInfo?.target && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">พร้อมเพย์: {paymentInfo.targetFormatted || paymentInfo.target}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(paymentInfo.targetFormatted || paymentInfo.target)} aria-label="คัดลอกหมายเลขพร้อมเพย์">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}

                <Typography variant="body2">
                  ช่องทาง: {paymentInfo?.method === 'promptpay' ? 'PromptPay' : paymentInfo?.method || '-'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight={700}>ที่อยู่จัดส่ง</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{paymentOrder.shippingAddress || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700}>สถานะการชำระเงิน</Typography>
                {chipOf(paymentInfo?.status || 'pending', PAY_STATUS_UI)}
                {expiresAt && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: .5 }}>
                    หมดอายุ: {expiresAt.toLocaleString()}
                  </Typography>
                )}
                {paidAt && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    ชำระเมื่อ: {paidAt.toLocaleString()}
                  </Typography>
                )}
              </Box>

              {paymentInfo?.payload && (
                <Button variant="outlined" onClick={() => handleCopy(paymentInfo.payload)} startIcon={<ContentCopyIcon />}>
                  คัดลอกโค้ด PromptPay
                </Button>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePaymentDialog}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
