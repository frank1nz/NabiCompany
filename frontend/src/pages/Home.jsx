// src/pages/Home.jsx
import { Typography, Box, Divider, Container, Button, Stack, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Products from './Products';

export default function Home() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;
  const heroStart = brand?.blue2 || theme.palette.primary.main;
  const heroEnd = brand?.navy || theme.palette.primary.dark;

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
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
              maxWidth: 980,              // ✅ คุมความกว้างเนื้อหา
              mx: 'auto',
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
