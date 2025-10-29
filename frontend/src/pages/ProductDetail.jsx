// src/pages/ProductDetail.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  IconButton,
  ImageList,
  ImageListItem,
  Link as MuiLink,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { darken } from '@mui/material/styles';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProductById } from '../lib/products';
import { useCart } from '../store/cartStore';
import { useAuth } from '../store/authStore';

const uploadBase = import.meta.env.VITE_UPLOAD_BASE;
const buildImg = (path) =>
  path?.startsWith?.('http') ? path : `${uploadBase}/${path}`.replace(/\/+$/, (match) => (match.length > 1 ? '/' : match));

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const accent = theme.palette.secondary.main;
  const accentHover = darken(accent, 0.12);
  const contrast = theme.palette.secondary.contrastText;

  const addItem = useCart((state) => state.addItem);
  const cartLoading = useCart((state) => state.loading);
  const loadCart = useCart((state) => state.loadCart);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const isLoggedIn = !!user;
  const isVerified =
    user?.role === 'admin' ||
    user?.isVerified ||
    user?.kycStatus === 'approved' ||
    user?.canOrderViaLine === true;
  const canAddToCart = isLoggedIn && user?.role === 'user' && isVerified;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    setProduct(null);

    fetchProductById(id)
      .then((data) => {
        if (!alive) return;
        setProduct(data);
        setSelectedImage(data?.images?.[0] ? buildImg(data.images[0]) : '');
        const initialQty = Number(data?.stock ?? 0) > 0 ? 1 : 0;
        setQuantity(initialQty);
        setError('');
      })
      .catch((err) => {
        if (!alive) return;
        const message =
          err?.response?.data?.message ||
          (err?.response?.status === 404 ? 'ไม่พบสินค้า' : 'ไม่สามารถโหลดข้อมูลสินค้าได้');
        setError(message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'user') {
      loadCart().catch(() => {});
    }
  }, [isLoggedIn, user?.role, loadCart]);

  const tags = useMemo(() => product?.tags || [], [product?.tags]);
  const priceDisplay = useMemo(() => {
    if (typeof product?.price !== 'number') return '-';
    return `฿ ${product.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
  }, [product?.price]);

  const availableStock = Math.max(0, Number(product?.stock ?? 0));
  const outOfStock = availableStock <= 0;
  const lowStock = !outOfStock && availableStock <= 5;
  const maxSelectable = outOfStock ? 0 : Math.min(99, Math.floor(availableStock));

  useEffect(() => {
    if (!product) return;
    if (outOfStock) {
      setQuantity(0);
    } else {
      setQuantity((prev) => {
        if (typeof prev !== 'number' || !Number.isFinite(prev) || prev <= 0) {
          return 1;
        }
        return Math.min(prev, maxSelectable);
      });
    }
  }, [product, outOfStock, maxSelectable]);

  const handleQuantityChange = (val) => {
    const numeric = Math.floor(Number(val));
    if (!Number.isFinite(numeric)) return;
    if (maxSelectable <= 0) {
      setQuantity(0);
      return;
    }
    setQuantity(Math.max(1, Math.min(maxSelectable, numeric)));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isLoggedIn) {
      setFeedback({ type: 'error', message: 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ' });
      navigate('/login', { state: { from: `/products/${product._id}` } });
      return;
    }
    if (!canAddToCart) {
      setFeedback({
        type: 'error',
        message: 'บัญชียังไม่ผ่านการยืนยัน กรุณารอแอดมินตรวจสอบ',
      });
      return;
    }
    if (outOfStock) {
      setFeedback({ type: 'error', message: `สินค้า "${product.name}" หมดสต็อก` });
      return;
    }
    if (quantity <= 0) {
      setFeedback({ type: 'error', message: 'กรุณาเลือกจำนวนที่ต้องการ' });
      return;
    }
    setAdding(true);
    setFeedback({ type: '', message: '' });
    try {
      const commitQty = Math.max(1, Math.min(quantity, maxSelectable || quantity));
      const data = await addItem(product._id, commitQty);
      const notice = data?.notice;
      setFeedback({
        type: notice ? 'warning' : 'success',
        message:
          notice || `เพิ่ม "${product.name}" จำนวน ${commitQty} ชิ้นลงตะกร้าแล้ว`,
      });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'เพิ่มสินค้าไม่สำเร็จ';
      setFeedback({ type: 'error', message });
    } finally {
      setAdding(false);
    }
  };

  const primaryImage = selectedImage || (product?.images?.[0] ? buildImg(product.images[0]) : '');

  return (
    <Box sx={{ py: { xs: 3, md: 5 } }}>
      <Button
        variant="text"
        size="small"
        startIcon={<ChevronLeftRoundedIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        กลับไปหน้าก่อนหน้า
      </Button>

      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, fontSize: 14 }}>
        <MuiLink component={Link} underline="hover" color="inherit" to="/">
          <HomeRoundedIcon fontSize="inherit" />
        </MuiLink>
        <MuiLink component={Link} underline="hover" color="inherit" to="/products">
          สินค้า
        </MuiLink>
        <Typography color="text.primary">{product?.name || 'รายละเอียดสินค้า'}</Typography>
      </Breadcrumbs>

      <Paper
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          boxShadow: '0 12px 32px rgba(0,0,0,.06)',
          border: '1px solid rgba(0,0,0,.05)',
        }}
      >
        {loading ? (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Skeleton variant="rectangular" sx={{ width: { xs: '100%', md: 420 }, height: 320, borderRadius: 3 }} />
            <Stack spacing={2}>
              <Skeleton width={280} height={36} />
              <Skeleton width={160} height={28} />
              <Skeleton height={18} width={200} />
              <Skeleton height={18} width={320} />
              <Skeleton height={60} />
              <Skeleton width={220} height={48} />
            </Stack>
          </Stack>
        ) : error ? (
          <Typography color="error" variant="body1">
            {error}
          </Typography>
        ) : !product ? (
          <Typography color="text.secondary">ไม่พบสินค้า</Typography>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 5 }}>
            <Box sx={{ width: { xs: '100%', md: 420 } }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  pt: '75%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,.08)',
                  mb: 2,
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {primaryImage ? (
                  <Box
                    component="img"
                    src={primaryImage}
                    alt={product.name}
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
                          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="100%" height="100%" fill="#f4f4f4"/><text x="50%" y="50%" text-anchor="middle" fill="#bbb" font-size="28" font-family="Arial">No Image</text></svg>`
                        );
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    ไม่มีรูปภาพ
                  </Typography>
                )}
              </Box>

              {product.images?.length > 1 && (
                <ImageList cols={4} gap={12} sx={{ m: 0 }}>
                  {product.images.map((img) => {
                    const src = buildImg(img);
                    const active = src === primaryImage;
                    return (
                      <ImageListItem key={img} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box
                          component="img"
                          src={src}
                          alt=""
                          onClick={() => setSelectedImage(src)}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: active
                              ? `2px solid ${accent}`
                              : '1px solid rgba(0,0,0,.08)',
                            opacity: active ? 1 : 0.85,
                            transition: 'transform .2s, opacity .2s',
                            '&:hover': { transform: 'scale(1.02)', opacity: 1 },
                          }}
                        />
                      </ImageListItem>
                    );
                  })}
                </ImageList>
              )}
            </Box>

            <Stack spacing={3} sx={{ flex: 1 }}>
              <Box>
                <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: 0.4, mb: 1 }}>
                  {product.name}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="h6" fontWeight={800} color="success.dark">
                    {priceDisplay}
                  </Typography>
                  <Chip
                    label={outOfStock ? 'หมดสต็อก' : `คงเหลือ ${availableStock} ชิ้น`}
                    size="small"
                    color={outOfStock ? 'error' : lowStock ? 'warning' : 'success'}
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
                {lowStock && !outOfStock && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                    สินค้าคงเหลือน้อย กรุณาชำระเพื่อยืนยันการจอง
                  </Typography>
                )}
              </Box>

              {tags.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {tags.map((tag) => (
                    <Chip key={tag} label={tag} variant="outlined" size="small" sx={{ textTransform: 'capitalize' }} />
                  ))}
                </Stack>
              )}

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  รายละเอียดสินค้า
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {product.description || 'ไม่มีรายละเอียด'}
                </Typography>
              </Box>

              <Divider />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || adding || cartLoading || outOfStock}
                  >
                    <RemoveRoundedIcon />
                  </IconButton>
                  <TextField
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    size="small"
                    sx={{ width: 90 }}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      min: outOfStock ? 0 : 1,
                      max: maxSelectable || undefined,
                    }}
                    disabled={adding || outOfStock}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={outOfStock || adding || cartLoading || quantity >= maxSelectable}
                  >
                    <AddRoundedIcon />
                  </IconButton>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartCheckoutRoundedIcon />}
                    onClick={handleAddToCart}
                    disabled={adding || cartLoading || outOfStock || quantity <= 0}
                    sx={{
                      flexGrow: 1,
                      fontWeight: 800,
                      bgcolor: accent,
                      color: contrast,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { bgcolor: accentHover },
                    }}
                  >
                    {outOfStock ? 'สินค้าหมด' : adding || cartLoading ? 'กำลังเพิ่ม…' : 'เพิ่มลงตะกร้า'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/orders')}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    ไปหน้าตะกร้า
                  </Button>
                </Stack>
              </Stack>

              {!!feedback.message && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color:
                      feedback.type === 'error'
                        ? 'error.main'
                        : feedback.type === 'warning'
                        ? 'warning.main'
                        : 'success.main',
                  }}
                >
                  {feedback.message}
                </Typography>
              )}
            </Stack>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
