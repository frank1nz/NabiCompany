// src/pages/Products.jsx (refined)
import { useEffect, useMemo, useState } from 'react';
import {
  Paper, Typography, Card, CardContent, CardMedia,
  Chip, Stack, Box, CardActionArea, CardActions, Button, Skeleton, Alert, Snackbar,
} from '@mui/material';
import { fetchPublicProducts } from '../lib/products';
import { useAuth } from '../store/authStore';
import { useCart } from '../store/cartStore';
import { useNavigate, useLocation } from 'react-router-dom';

const uploadBase = import.meta.env.VITE_UPLOAD_BASE;
const imgSrc = (path) => (path?.startsWith?.('http') ? path : `${uploadBase}/${path}`);

export default function Products({
  compact = false,
  limit = null,              // 👈 กำหนดจำนวนสูงสุดที่จะแสดง (เช่น 6/9/12)
  showTitle = !compact,      // 👈 ซ่อน/แสดงหัวข้อ
}) {
  const [items, setItems]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const addItem = useCart((state) => state.addItem);
  const cartBusy = useCart((state) => state.loading);
  const [addingId, setAddingId] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const isLoggedIn = !!user;
  const canUseCart =
    user?.role === 'user' &&
    (user?.isVerified || user?.kycStatus === 'approved' || user?.canOrderViaLine === true);

  useEffect(() => {
    setLoad(true);
    fetchPublicProducts()
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'โหลดสินค้าไม่สำเร็จ');
      })
      .finally(() => setLoad(false));
  }, []);

  // เลือกจำนวนแสดงผล
  const list = useMemo(() => {
    const base = compact ? items.slice(0, 6) : items;
    return typeof limit === 'number' ? base.slice(0, limit) : base;
  }, [items, compact, limit]);

  const fmtPrice = (n) =>
    typeof n === 'number'
      ? `฿ ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : '-';

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!canUseCart) {
      setFeedback({ type: 'error', message: 'บัญชียังไม่ผ่านการยืนยัน ไม่สามารถสั่งซื้อได้' });
      return;
    }
    const stock = Number(product.stock ?? 0);
    if (stock <= 0) {
      setFeedback({ type: 'error', message: `สินค้า "${product.name}" หมดสต็อก` });
      return;
    }
    setAddingId(product._id);
    try {
      const data = await addItem(product._id, 1);
      const notice = data?.notice;
      setFeedback({
        type: notice ? 'warning' : 'success',
        message: notice || `เพิ่ม "${product.name}" ลงตะกร้าแล้ว`,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'ไม่สามารถเพิ่มสินค้าได้';
      setFeedback({ type: 'error', message });
    } finally {
      setAddingId('');
    }
  };

  const handleCloseFeedback = () => setFeedback({ type: '', message: '' });

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 3 },
        maxWidth: 1200,
        mx: 'auto',
        width: '100%',
        borderRadius: 3,
        boxShadow: '0 8px 24px rgba(0,0,0,.04)',
        border: '1px solid rgba(0,0,0,.06)',
        bgcolor: '#fff',
      }}
      elevation={0}
    >
      {showTitle && (
        <Typography
          variant="h6"
          mb={2}
          fontWeight={900}
          align="center"
          sx={{ letterSpacing: 0.3 }}
        >
          Featured Products
        </Typography>
      )}

      {/* แจ้ง error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* กริดสินค้า */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: { xs: 2, md: 3 },
        }}
      >
        {/* Skeleton ตอนโหลด */}
        {loading &&
          Array.from({ length: compact ? 6 : 9 }).map((_, i) => (
            <Box key={`sk-${i}`}>
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
              <Skeleton height={24} sx={{ mt: 1, width: '80%' }} />
              <Skeleton height={18} sx={{ width: '60%' }} />
            </Box>
          ))}

        {/* การ์ดสินค้า */}
        {!loading &&
          list.map((product) => {
            const cover = product.images?.[0];
            const stock = Number(product.stock ?? 0);
            const outOfStock = stock <= 0;
            const lowStock = !outOfStock && stock <= 5;
            const isBusy = addingId === product._id || cartBusy;
            const buttonLabel = outOfStock ? 'หมดสต็อก' : isBusy ? 'กำลังเพิ่ม…' : 'เพิ่มลงตะกร้า';
            return (
              <Card
                key={product._id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 6px 16px rgba(0,0,0,.05)',
                  transition: 'transform .18s ease, box-shadow .18s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 28px rgba(0,0,0,.08)',
                  },
                }}
              >
                <CardActionArea onClick={() => navigate(`/products/${product._id}`)}>
                  {/* รูปอัตราส่วนคงที่ (16:10) */}
                  <Box sx={{ position: 'relative', width: '100%', pt: '62.5%' }}>
                    {cover ? (
                      <CardMedia
                        component="img"
                        image={imgSrc(cover)}
                        alt={product.name}
                        loading="lazy"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            'data:image/svg+xml;utf8,' +
                            encodeURIComponent(
                              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="100%" height="100%" fill="#f2f2f2"/><text x="50%" y="50%" text-anchor="middle" fill="#aaa" font-size="28" font-family="Arial">No Image</text></svg>`
                            );
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: '#f5f5f5',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'text.disabled',
                          fontSize: 14,
                        }}
                      >
                        No Image
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={800}
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.name}
                    </Typography>

                    {product.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 40,
                        }}
                      >
                        {product.description}
                      </Typography>
                    )}

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mt: 1.25 }}
                    >
                      <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#0f5132' }}>
                        {fmtPrice(product.price)}
                      </Typography>
                      <Chip
                        label={outOfStock ? 'หมดสต็อก' : `คงเหลือ ${Math.max(0, stock)} ชิ้น`}
                        size="small"
                        color={outOfStock ? 'error' : lowStock ? 'warning' : 'success'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    {!!product.tags?.length && (
                      <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                        {product.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        ))}
                        {product.tags.length > 3 && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`+${product.tags.length - 3}`}
                          />
                        )}
                      </Stack>
                    )}
                  </CardContent>
                </CardActionArea>

              
              </Card>
            );
          })}

        {/* ว่างเปล่า */}
        {!loading && list.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, gridColumn: '1 / -1' }}>
            <Typography color="text.secondary">ยังไม่มีสินค้าให้แสดง</Typography>
          </Box>
        )}
      </Box>

      <Snackbar
        open={!!feedback.message}
        autoHideDuration={5000}
        onClose={handleCloseFeedback}
        message={feedback.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: {
            bgcolor:
              feedback.type === 'error'
                ? 'error.main'
                : feedback.type === 'warning'
                ? 'warning.main'
                : 'success.main',
            color: feedback.type === 'warning' ? '#111' : '#fff',
          },
        }}
      />
    </Paper>
  );
}
