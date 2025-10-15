// src/pages/Products.jsx (refined)
import { useEffect, useMemo, useState } from 'react';
import {
  Paper, Typography, Card, CardContent, CardMedia,
  Chip, Stack, Box, CardActionArea, Skeleton, Alert
} from '@mui/material';
import { fetchPublicProducts } from '../lib/products';

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
                <CardActionArea
                  onClick={() => {
                    // ถ้ามีหน้า detail ในอนาคต: navigate(`/products/${product._id}`)
                  }}
                >
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
    </Paper>
  );
}
