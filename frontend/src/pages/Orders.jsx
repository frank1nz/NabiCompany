import { useEffect, useMemo, useState } from 'react';
import {
  Paper,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { fetchMyOrders, checkoutCart } from '../lib/orders';
import { useAuth } from '../store/authStore';
import { useCart } from '../store/cartStore';
import PromptPayQr from '../components/PromptPayQr';

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ORDER_STATUS_COLORS = {
  pending: { color: 'warning', label: 'pending' },
  confirmed: { color: 'success', label: 'confirmed' },
  rejected: { color: 'error', label: 'rejected' },
  fulfilled: { color: 'primary', label: 'fulfilled' },
  cancelled: { color: 'default', label: 'cancelled' },
};

const PAYMENT_STATUS_COLORS = {
  pending: { color: 'warning', label: 'รอชำระ' },
  paid: { color: 'success', label: 'ชำระแล้ว' },
  failed: { color: 'error', label: 'ชำระไม่สำเร็จ' },
  expired: { color: 'default', label: 'หมดอายุ' },
};

const statusChip = (status, mapping) => {
  const map = mapping[status] || { color: 'default', label: status || 'unknown' };
  return (
    <Chip
      size="small"
      label={map.label}
      color={map.color}
      variant={status === 'pending' ? 'outlined' : 'filled'}
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

const getProductKey = (item) => item.productId || item.product?._id || item.product?.id || item.product;

export default function Orders() {
  const { user } = useAuth();

  const cartItems = useCart((state) => state.items);
  const totals = useCart((state) => state.totals);
  const cartLoading = useCart((state) => state.loading);
  const cartError = useCart((state) => state.error);

  const loadCart = useCart((state) => state.loadCart);
  const updateItem = useCart((state) => state.updateItem);
  const removeItem = useCart((state) => state.removeItem);
  const clearCart = useCart((state) => state.clear);
  const setCartState = useCart((state) => state.setCart);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  const [shippingAddress, setShippingAddress] = useState(user?.profile?.address || '');
  const [note, setNote] = useState('');

  const [quantities, setQuantities] = useState({});
  const [mutatingId, setMutatingId] = useState('');
  const [clearing, setClearing] = useState(false);
  const [cartMessage, setCartMessage] = useState({ type: '', text: '' });

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');
  const [paymentOrder, setPaymentOrder] = useState(null);

  useEffect(() => {
    setShippingAddress(user?.profile?.address || '');
  }, [user?.profile?.address]);

  useEffect(() => {
    const next = {};
    for (const item of cartItems) {
      const key = getProductKey(item);
      if (!key) continue;
      next[key] = item.quantity;
    }
    setQuantities(next);
  }, [cartItems]);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([loadCart().catch(() => null), loadOrders()]);
      } catch {
        /* noop */
      }
    };
    init();
  }, []);

  const loadOrders = async () => {
    setOrdersError('');
    setOrdersLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrdersError(err?.response?.data?.message || 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ');
    } finally {
      setOrdersLoading(false);
    }
  };

  const refreshAll = async () => {
    setCartMessage({ type: '', text: '' });
    setCheckoutError('');
    setCheckoutSuccess('');
    try {
      await Promise.all([loadCart().catch(() => null), loadOrders()]);
    } catch {
      /* noop */
    }
  };

  const handleQuantityInput = (productId, value) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const handleQuantityCommit = async (item) => {
    const productId = getProductKey(item);
    if (!productId) return;
    const raw = quantities[productId];
    const nextQty = Math.floor(Number(raw));
    if (!Number.isFinite(nextQty)) {
      setQuantities((prev) => ({ ...prev, [productId]: item.quantity }));
      return;
    }
    if (nextQty <= 0) {
      await handleRemove(item);
      return;
    }
    setMutatingId(productId);
    setCartMessage({ type: '', text: '' });
    try {
      const stock = Number(item.product?.stock ?? item.availableStock ?? Number.POSITIVE_INFINITY);
      const desired = Math.max(1, nextQty);
      const requestQty = Number.isFinite(stock) ? Math.min(desired, stock) : desired;
      const data = await updateItem(productId, requestQty);
      if (data?.notice) {
        setCartMessage({ type: 'warning', text: data.notice });
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'อัปเดตจำนวนไม่สำเร็จ';
      setCartMessage({ type: 'error', text: message });
      setQuantities((prev) => ({ ...prev, [productId]: item.quantity }));
    } finally {
      setMutatingId('');
    }
  };

  const handleIncrement = async (item) => {
    const productId = getProductKey(item);
    if (!productId) return;
    setMutatingId(productId);
    setCartMessage({ type: '', text: '' });
    try {
      const stock = Number(item.product?.stock ?? item.availableStock ?? Number.POSITIVE_INFINITY);
      const desired = Number(item.quantity || 0) + 1;
      const requestQty = Number.isFinite(stock) ? Math.min(desired, stock) : desired;
      const data = await updateItem(productId, requestQty);
      if (data?.notice) {
        setCartMessage({ type: 'warning', text: data.notice });
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'เพิ่มจำนวนไม่สำเร็จ';
      setCartMessage({ type: 'error', text: message });
    } finally {
      setMutatingId('');
    }
  };

  const handleDecrement = async (item) => {
    const productId = getProductKey(item);
    if (!productId) return;
    const current = Number(item.quantity || 0);
    if (current <= 1) {
      await handleRemove(item);
      return;
    }
    setMutatingId(productId);
    setCartMessage({ type: '', text: '' });
    try {
      const data = await updateItem(productId, current - 1);
      if (data?.notice) {
        setCartMessage({ type: 'warning', text: data.notice });
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'ลดจำนวนไม่สำเร็จ';
      setCartMessage({ type: 'error', text: message });
    } finally {
      setMutatingId('');
    }
  };

  const handleRemove = async (item) => {
    const productId = getProductKey(item);
    if (!productId) return;
    setMutatingId(productId);
    setCartMessage({ type: '', text: '' });
    try {
      await removeItem(productId);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'นำสินค้าออกไม่สำเร็จ';
      setCartMessage({ type: 'error', text: message });
    } finally {
      setMutatingId('');
    }
  };

  const handleClearCart = async () => {
    setCartMessage({ type: '', text: '' });
    setClearing(true);
    try {
      await clearCart();
      setCheckoutSuccess('');
      setCheckoutError('');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'ไม่สามารถล้างตะกร้าได้';
      setCartMessage({ type: 'error', text: message });
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = async () => {
    const address = (shippingAddress || '').trim();
    if (!address) {
      setCheckoutError('กรุณากรอกที่อยู่จัดส่ง');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');
    setCheckoutSuccess('');
    setCartMessage({ type: '', text: '' });
    try {
      const data = await checkoutCart({
        note,
        shippingAddress: address,
      });

      if (data?.cart) {
        setCartState(data.cart);
      } else {
        await loadCart().catch(() => null);
      }
      setNote('');
      setCheckoutSuccess('สร้างคำสั่งซื้อสำเร็จ กรุณาชำระเงินผ่าน PromptPay');
      setPaymentOrder(data?.order || null);
      await loadOrders();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'ไม่สามารถทำรายการได้';
      setCheckoutError(message);
      if (err?.response?.data?.cart) {
        setCartState(err.response.data.cart);
        setCartMessage({ type: 'warning', text: message });
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const cartEmpty = !cartLoading && cartItems.length === 0;
  const totalsDisplay = useMemo(
    () => ({
      amount: fmtMoney(totals.amount || 0),
      quantity: Number(totals.quantity || 0),
    }),
    [totals.amount, totals.quantity]
  );

  const canCheckout = !checkoutLoading && !cartEmpty;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCheckoutSuccess('คัดลอกข้อมูลเรียบร้อย');
    } catch {
      setCheckoutError('คัดลอกข้อมูลไม่สำเร็จ');
    }
  };

  const paymentDialogOpen = Boolean(paymentOrder);

  const closePaymentDialog = () => setPaymentOrder(null);

  const paymentInfo = paymentOrder?.payment || {};
  const expiresAt = paymentInfo?.expiresAt ? new Date(paymentInfo.expiresAt) : null;
  const paidAt = paymentInfo?.paidAt ? new Date(paymentInfo.paidAt) : null;

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={900}>
            ตะกร้าสินค้า
          </Typography>
          <Tooltip title="รีเฟรช">
            <span>
              <IconButton onClick={refreshAll} disabled={cartLoading || ordersLoading}>
                <RefreshRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {cartError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {cartError}
          </Alert>
        )}
        {!!cartMessage.text && (
          <Alert
            severity={
              cartMessage.type === 'error'
                ? 'error'
                : cartMessage.type === 'warning'
                ? 'warning'
                : 'success'
            }
            sx={{ mb: 2 }}
          >
            {cartMessage.text}
          </Alert>
        )}
        {!!checkoutError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {checkoutError}
          </Alert>
        )}
        {!!checkoutSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {checkoutSuccess}
          </Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>สินค้า</TableCell>
              <TableCell align="right">ราคา/ชิ้น</TableCell>
              <TableCell align="center" sx={{ width: 200 }}>
                จำนวน
              </TableCell>
              <TableCell align="right">รวม</TableCell>
              <TableCell align="center" sx={{ width: 80 }}>
                ลบ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cartLoading &&
              Array.from({ length: 3 }).map((_, idx) => (
                <TableRow key={`cart-sk-${idx}`}>
                  <TableCell>
                    <Skeleton width={260} />
                    <Skeleton width={180} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={120} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={40} />
                  </TableCell>
                </TableRow>
              ))}

            {!cartLoading &&
              cartItems.map((item) => {
                const productId = getProductKey(item);
                const quantity = quantities[productId] ?? item.quantity ?? 0;
                const numericQuantity = Number(quantity) || 0;
                const unitPrice = Number(item.unitPrice || 0);
                const lineTotal = Number(item.lineTotal || unitPrice * (item.quantity || 0));
                const productName = item.product?.name || item.name || 'สินค้า';
                const stockRaw = Number(item.product?.stock ?? item.availableStock ?? Number.NaN);
                const hasFiniteStock = Number.isFinite(stockRaw);
                const availableStock = hasFiniteStock ? Math.max(0, stockRaw) : null;
                const outOfStock = hasFiniteStock ? availableStock <= 0 : false;
                const lowStock = hasFiniteStock ? availableStock > 0 && availableStock <= 5 : false;
                const maxReached =
                  hasFiniteStock && availableStock !== null ? numericQuantity >= availableStock : false;
                const incrementDisabled =
                  mutatingId === productId ||
                  checkoutLoading ||
                  (hasFiniteStock && availableStock !== null && numericQuantity >= availableStock);

                return (
                  <TableRow key={productId}>
                    <TableCell>
                      <Typography fontWeight={700}>{productName}</Typography>
                      {item.product?.sku && (
                        <Typography variant="caption" color="text.secondary">
                          SKU: {item.product.sku}
                        </Typography>
                      )}
                      {hasFiniteStock && (
                        <Typography
                          variant="caption"
                          color={
                            outOfStock ? 'error.main' : lowStock ? 'warning.main' : 'text.secondary'
                          }
                          display="block"
                        >
                          คงเหลือ {availableStock} ชิ้น
                        </Typography>
                      )}
                      {maxReached && !outOfStock && (
                        <Typography variant="caption" color="warning.main" display="block">
                          ถึงจำนวนสูงสุดตามสต็อกแล้ว
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">฿ {fmtMoney(unitPrice)}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleDecrement(item)}
                          disabled={mutatingId === productId || checkoutLoading}
                          aria-label="ลดจำนวน"
                        >
                          <RemoveRoundedIcon />
                        </IconButton>
                        <TextField
                          value={quantity}
                          onChange={(e) => handleQuantityInput(productId, e.target.value)}
                          onBlur={() => handleQuantityCommit(item)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleQuantityCommit(item);
                            }
                          }}
                          size="small"
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                            min: 0,
                            max: hasFiniteStock && availableStock !== null ? availableStock : undefined,
                          }}
                          sx={{ width: 80 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleIncrement(item)}
                          disabled={incrementDisabled}
                          aria-label="เพิ่มจำนวน"
                        >
                          <AddRoundedIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">฿ {fmtMoney(lineTotal)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="นำออก">
                        <span>
                          <IconButton
                            color="error"
                            onClick={() => handleRemove(item)}
                            disabled={mutatingId === productId || checkoutLoading}
                          >
                            <DeleteOutlineRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

            {cartEmpty && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">ยังไม่มีสินค้าในตะกร้า</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

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
              <Typography variant="subtitle1" fontWeight={800}>
                รายการทั้งหมด: {totalsDisplay.quantity} ชิ้น
              </Typography>
              <Typography variant="subtitle1" fontWeight={900}>
                ยอดรวม: ฿ {totalsDisplay.amount}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleClearCart}
                disabled={cartEmpty || clearing || checkoutLoading}
              >
                {clearing ? 'กำลังล้าง…' : 'ล้างตะกร้า'}
              </Button>
              <Button
                variant="contained"
                onClick={handleCheckout}
                disabled={!canCheckout || checkoutLoading}
                sx={{ fontWeight: 800 }}
              >
                {checkoutLoading ? 'กำลังสร้างคำสั่งซื้อ…' : 'ชำระเงิน'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={900} mb={2}>
          ประวัติคำสั่งซื้อ
        </Typography>

        {ordersError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {ordersError}
          </Alert>
        )}

        <Table size="small">
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
            {ordersLoading &&
              Array.from({ length: 4 }).map((_, idx) => (
                <TableRow key={`order-sk-${idx}`}>
                  <TableCell>
                    <Skeleton width={160} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={120} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={160} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton width={80} />
                  </TableCell>
                </TableRow>
              ))}

            {!ordersLoading &&
              orders.map((order) => {
                const itemCount =
                  order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
                const paymentStatus = order.payment?.status || 'pending';
                const showPayButton = paymentStatus === 'pending';
                return (
                  <TableRow key={order.id}>
                    <TableCell sx={{ fontFamily: 'ui-monospace, monospace' }}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={700}>
                          {order.id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          สร้างเมื่อ {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{statusChip(order.status, ORDER_STATUS_COLORS)}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        {statusChip(paymentStatus, PAYMENT_STATUS_COLORS)}
                        {order.payment?.reference && (
                          <Typography variant="caption" color="text.secondary">
                            REF: {order.payment.reference}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">฿ {fmtMoney(order.total || 0)}</TableCell>
                    <TableCell align="right">{itemCount}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setPaymentOrder(order)}
                        >
                          ดูรายละเอียด
                        </Button>
                        {showPayButton && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => setPaymentOrder(order)}
                            sx={{ fontWeight: 700 }}
                          >
                            ชำระเงิน
                          </Button>
                        )}
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
      </Paper>

      <Dialog open={paymentDialogOpen} onClose={closePaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={800}>
            รายละเอียดการชำระเงิน
          </Typography>
          <IconButton onClick={closePaymentDialog} aria-label="ปิด">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {paymentOrder && (
            <Stack spacing={2}>
              <PromptPayQr payload={paymentInfo?.payload} size={260} label="สแกนเพื่อชำระผ่าน PromptPay" />

              <Box>
                <Typography variant="body2">
                  ยอดชำระ: ฿ {fmtMoney(paymentInfo?.amount || paymentOrder.total || 0)}
                </Typography>
                {paymentInfo?.reference && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">รหัสอ้างอิง: {paymentInfo.reference}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(paymentInfo.reference)}
                      aria-label="คัดลอกหมายเลขอ้างอิง"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
                {paymentInfo?.target && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">
                      พร้อมเพย์: {paymentInfo.targetFormatted || paymentInfo.target}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleCopy(paymentInfo.targetFormatted || paymentInfo.target)
                      }
                      aria-label="คัดลอกหมายเลขพร้อมเพย์"
                    >
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
                <Typography variant="subtitle2" fontWeight={700}>
                  ที่อยู่จัดส่ง
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {paymentOrder.shippingAddress || '-'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  สถานะการชำระเงิน
                </Typography>
                {statusChip(paymentInfo?.status || 'pending', PAYMENT_STATUS_COLORS)}
                {expiresAt && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
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
                <Button
                  variant="outlined"
                  onClick={() => handleCopy(paymentInfo.payload)}
                  startIcon={<ContentCopyIcon />}
                >
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
