// src/pages/Home.jsx
import { Typography, Box, Divider, Container, Button, Stack, useTheme, IconButton, Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { fetchPublicNews } from '../lib/news';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Products from './Products';
const uploadBase = import.meta.env.VITE_UPLOAD_BASE;

function buildUploadUrl(path) {
  if (!path) return '';
  if (typeof path === 'string' && path.startsWith('http')) return path;
  const base = (uploadBase || window.location.origin).replace(/\/$/, '');
  const cleaned = String(path).replace(/\\/g, '/').replace(/^\/+/, '');
  return `${base}/${cleaned}`;
}

export default function Home() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;
  const heroStart = brand?.blue2 || theme.palette.primary.main;
  const heroEnd = brand?.navy || theme.palette.primary.dark;

  // === News state ===
  const [news, setNews] = useState([]);
  const [idx, setIdx] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchPublicNews()
      .then((rows) => { if (alive) setNews(Array.isArray(rows) ? rows : []); })
      .catch(() => { if (alive) setNews([]); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (pause || news.length <= 1) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % news.length), 6000);
    return () => clearInterval(timer);
  }, [news.length, pause]);

  const go = (next = true) => {
    if (!news.length) return;
    setIdx((i) => (next ? (i + 1) : (i - 1 + news.length)) % news.length);
  };

  return (
    <Box sx={{  minHeight: '100vh' }}>
      {/* HERO */}
      <Box
        component="section"
        aria-label="Hero"
        sx={{
          position: 'relative',
          color: '#fff',
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${heroStart}, ${heroEnd})`,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(80% 60% at 100% 0%, rgba(255,255,255,.10) 0%, transparent 60%), radial-gradient(70% 50% at 0% 100%, rgba(0,0,0,.10) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
          '@media (prefers-reduced-motion: reduce)': { '&::after': { background: 'none' } },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              maxWidth: "auto",              // ✅ คุมความกว้างเนื้อหา
              maxHeight: 480,             // ✅ จำกัดความสูงไม่ให้สูงเกิน
              textAlign: 'center',
              px: { xs: 1.5, md: 0 },
            }}

          >
            <Typography
              variant="h2"
              component="h1"
              fontWeight={900}
              sx={{
                fontSize: { xs: 34, sm: 42, md: 56 },
                lineHeight: 1.08,
                letterSpacing: { xs: 0, md: 0.2 },
                fontFamily: '"Playfair Display", serif',
                mb: 2,
                textShadow: '0 2px 8px rgba(0,0,0,.25)',   // ✅ ช่วยให้อ่านชัด
              }}
            >
              Crafting Thailand’s <br /> Finest Spirits
            </Typography>

            {/* ✅ คำอธิบาย (subtitle) — ทำให้กลับมาเห็นแน่นอน */}
            <Typography
              variant="h6"
              sx={{
                maxWidth: 760,           // คุมความกว้างเพื่อไม่ให้บรรทัดยาวเกิน
                mx: 'auto',
                mt: { xs: 1, md: 1.5 },
                mb: { xs: 3.5, md: 4.5 }, // เผื่อระยะก่อนปุ่ม
                lineHeight: 1.7,
                fontWeight: 400,
                color: 'rgba(255,255,255,.92)', // ตัดกับพื้นหลังชัด ๆ
                textShadow: '0 1px 4px rgba(0,0,0,.25)',
              }}
            >
              Experience the essence of Thai heritage through our handcrafted premium spirits.
              Each bottle tells a story of tradition and innovation.
            </Typography>

            <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap>
              <Button
                href="/products"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                px: 3,
                py: 1.2,
                fontWeight: 900,
                borderRadius: 999,
                color: theme.palette.secondary.contrastText,
                bgcolor: accent,
                boxShadow: `0 10px 22px ${alpha(accent, 0.25)}, inset 0 1px 0 ${alpha(
                  theme.palette.common.white,
                  0.28
                )}`,
                '&:hover': {
                  bgcolor: alpha(accent, 0.92),
                  boxShadow: `0 10px 22px ${alpha(accent, 0.35)}`,
                },
              }}
            >
              Explore Products
            </Button>

              <Button
                href="/about"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,.7)',
                  color: '#fff',
                  px: 2.2,
                  fontWeight: 800,
                  borderWidth: 2,
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.10)' },
                }}
              >
                Our Story
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* LATEST NEWS — full-bleed style (no frame) */}
      {!!news.length && (
        <Container component="section" aria-label="Latest news" sx={{ pt: { xs: 4, md: 6 } }}>
          <Box
            onMouseEnter={() => setPause(true)}
            onMouseLeave={() => setPause(false)}
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              height: { xs: 240, sm: 300, md: 420 },
              // no border, no shadow — clean, edge-to-edge inside container
            }}
          >
            {/* slide image */}
            <Box sx={{ position: 'absolute', inset: 0 }}>
              <Box
                sx={{
                  position: 'absolute', inset: 0,
                  backgroundImage: news[idx]?.image ? `url("${buildUploadUrl(news[idx].image)}")` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(.9)'
                }}
              />
              {/* gradient overlay for readability */}
              <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${alpha('#000', .55)} 0%, ${alpha('#000', .15)} 45%, transparent 70%)` }} />
            </Box>

            {/* slide controls (arrows) */}
            <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
              {news.length > 1 && (
                <>
                  <IconButton onClick={() => go(false)} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: alpha('#fff', .85), '&:hover': { bgcolor: '#fff' } }}>
                    <ChevronLeftRoundedIcon />
                  </IconButton>
                  <IconButton onClick={() => go(true)} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', bgcolor: alpha('#fff', .85), '&:hover': { bgcolor: '#fff' } }}>
                    <ChevronRightRoundedIcon />
                  </IconButton>
                </>
              )}
            </Box>

            {/* caption overlay inside image at bottom */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2,
                px: { xs: 2, md: 4 },
                py: { xs: 1.5, md: 2 },
                color: '#fff',
                background: `linear-gradient(180deg, ${alpha('#000', 0)} 0%, ${alpha('#000', .55)} 30%, ${alpha('#000', .65)} 100%)`,
              }}
            >
              <Chip label="NEWS" size="small" sx={{ bgcolor: alpha('#fff', .2), color: '#fff', fontWeight: 800, mr: 1, mb: 0.5 }} />
              <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2, mb: 0.25 }}>
                {news[idx]?.title}
              </Typography>
              {news[idx]?.description && (
                <Typography variant="body2" sx={{ color: alpha('#fff', .9), display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {news[idx].description}
                </Typography>
              )}

              {/* dots inside overlay */}
              {news.length > 1 && (
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 1 }}>
                  {news.map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => setIdx(i)}
                      sx={{
                        width: 28,
                        height: 4,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: i === idx ? '#fff' : alpha('#fff', .45),
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Box>


          {/* thumbnails */}
          {news.length > 1 && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, overflow: 'hidden' }}>
              {news.map((n, i) => (
                <Box
                  key={n.id}
                  onClick={() => setIdx(i)}
                  sx={{
                    position: 'relative',
                    width: 112,
                    height: 64,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: 'none',
                    flex: '0 0 auto',
                  }}
                  title={n.title}
                >
                  {n.image ? (
                    <img
                      src={buildUploadUrl(n.image)}
                      alt={n.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{ width: '100%', height: '100%', bgcolor: alpha(theme.palette.text.primary, .06) }} />
                  )}
                  {i === idx && (
                    <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, bgcolor: accent }} />
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Container>
      )}

      {/* FEATURED */}
      <Container component="section" aria-label="Featured products" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ color: brand?.navy || theme.palette.text.primary, mb: 1, letterSpacing: 0.2 }}
          >
            Featured Products
          </Typography>
          <Divider sx={{ width: 64, height: 4, mx: 'auto', bgcolor: accent, borderRadius: 2 }} />
        </Box>

        <Products compact limit={6} />

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 6, color: 'text.secondary', maxWidth: 820, mx: 'auto', lineHeight: 1.7 }}
        >
          Enjoy responsibly. Sales are restricted to customers aged 20 and above in compliance with
          Thai regulations. Identity verification (KYC) is required before checkout.
        </Typography>
      </Container>
    </Box>
  );
}
