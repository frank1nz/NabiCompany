// src/pages/Home.jsx
import { Typography, Box, Divider, Container, Button, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Products from './Products';

const BRAND = {
  navy: '#1C2738',
  navyEnd: '#2E415A',
  gold: '#D4AF37',
};

export default function Home() {
  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      {/* HERO */}
      <Box
        component="section"
        aria-label="Hero"
        sx={{
          position: 'relative',
          color: '#fff',
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.navyEnd})`,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(80% 60% at 100% 0%, rgba(255,255,255,.10) 0%, transparent 60%), radial-gradient(70% 50% at 0% 100%, rgba(0,0,0,.10) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
          // ถ้าผู้ใช้ตั้งค่า reduce motion ให้ลดเอฟเฟกต์พื้นหลัง
          '@media (prefers-reduced-motion: reduce)': {
            '&::after': { background: 'none' },
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: 880, mx: 'auto', textAlign: 'center', px: { xs: 1, md: 0 } }}>
            <Typography
              variant="h2"
              component="h1"           // ✅ ให้เป็น H1 ของหน้านี้
              fontWeight={900}
              sx={{
                fontSize: { xs: 34, sm: 42, md: 56 },
                lineHeight: 1.08,
                letterSpacing: { xs: 0, md: 0.2 },
                fontFamily: '"Playfair Display", serif',
                mb: 2,
              }}
            >
              Crafting Thailand’s <br /> Finest Spirits
            </Typography>

            <Typography
              variant="h6"
              sx={{
                maxWidth: 720,
                mx: 'auto',
                opacity: 0.92,
                lineHeight: 1.7,
                fontWeight: 400,
                mb: 4,
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
                  color: '#111',
                  bgcolor: BRAND.gold,
                  boxShadow: '0 10px 22px rgba(212,175,55,.25), inset 0 1px 0 rgba(255,255,255,.28)',
                  '&:hover': { bgcolor: '#C6A132', boxShadow: '0 10px 22px rgba(212,175,55,.35)' },
                }}
              >
                Explore Products
              </Button>

              <Button
                href="/about"
                variant="outlined"      // ✅ ชัดขึ้นบนพื้นเข้ม
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,.6)',
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

      {/* FEATURED */}
      <Container component="section" aria-label="Featured products" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" fontWeight={900} sx={{ color: BRAND.navy, mb: 1, letterSpacing: 0.2 }}>
            Featured Products
          </Typography>
          <Divider sx={{ width: 64, height: 4, mx: 'auto', bgcolor: BRAND.gold, borderRadius: 2 }} />
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
