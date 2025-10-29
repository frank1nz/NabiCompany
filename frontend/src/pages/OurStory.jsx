// src/pages/OurStory.jsx
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Divider,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import LocalFloristOutlinedIcon from '@mui/icons-material/LocalFloristOutlined';
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined';
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function OurStory() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;
  const accentHover = darken(accent, 0.12);
  const heroStart = brand?.blue2 || theme.palette.primary.main;
  const heroEnd = brand?.navy || theme.palette.primary.dark;

  return (
    <Box sx={{ bgcolor: theme.palette.background.paper }}>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          color: '#fff',
          background: `linear-gradient(135deg, ${heroStart}, ${heroEnd})`,
          py: { xs: 8, md: 12 },
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(80% 60% at 100% 0%, rgba(255,255,255,.10) 0%, transparent 60%), radial-gradient(70% 50% at 0% 100%, rgba(0,0,0,.12) 0%, transparent 60%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight={900}
                sx={{
                  fontSize: { xs: 34, sm: 42, md: 56 },
                  lineHeight: 1.1,
                  fontFamily: '"Playfair Display", serif',
                  mb: 2,
                }}
              >
                Our Story
              </Typography>
              <Typography sx={{ opacity: 0.92, lineHeight: 1.7, maxWidth: 720 }}>
                เราเริ่มต้นจากความหลงใหลในภูมิปัญญาท้องถิ่นของไทย
                และความเชื่อว่าความใส่ใจในรายละเอียดเล็ก ๆ จะสร้างสรรค์สุราที่ ‘มีตัวตน’ ได้จริง
                ทุกขวดของ NABI คือเรื่องเล่าระหว่างชุมชน ผู้ผลิต และผู้ดื่ม
              </Typography>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                loading="lazy"
                src="/assets/story-hero.jpg"
                alt="ภาพโรงกลั่นและทีมงานของเรา"
                onError={(e) => (e.currentTarget.style.display = 'none')}
                sx={{ width: '100%', borderRadius: 3, objectFit: 'cover', boxShadow: 2 }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* MISSION */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, height: '100%' }}>
              <Chip
                label="Our Mission"
                sx={{
                  bgcolor: alpha(accent, 0.18),
                  color: brand?.navy || theme.palette.text.primary,
                  mb: 2,
                  fontWeight: 700,
                }}
              />
              <Typography
                variant="h5"
                fontWeight={900}
                sx={{ color: brand?.navy || theme.palette.text.primary, mb: 1 }}
              >
                ยกระดับวัตถุดิบไทยสู่สุราพรีเมียม
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                เราคัดสรรข้าว สมุนไพร และผลไม้จากเกษตรกรไทย
                กลั่นอย่างประณีตด้วยกระบวนการสมัยใหม่ที่เคารพรสนิยมดั้งเดิม
                เพื่อให้ได้รสนุ่ม สมดุล และมีกลิ่นอายความเป็นไทยอย่างชัดเจน
              </Typography>
              <Stack spacing={1.2} sx={{ mt: 2 }}>
                {[
                  'คัดวัตถุดิบตามฤดูกาลและแหล่งปลูก',
                  'กระบวนการกลั่นเล็ก (small-batch) ใส่ใจทุกดีเทล',
                  'โปร่งใส ตรวจสอบย้อนกลับได้',
                ].map((t) => (
                  <Stack key={t} direction="row" gap={1} alignItems="center">
                    <CheckCircleOutlineIcon fontSize="small" color="success" />
                    <Typography variant="body2">{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                bgcolor: '#0f172a',
                color: '#fff',
              }}
            >
              <CardMedia
                component="img"
                loading="lazy"
                src="/assets/story-craft.jpg"
                alt="งานคราฟต์และคาแรกเตอร์ของสุรา"
                sx={{ height: 200, objectFit: 'cover', opacity: 0.9 }}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                  Craft & Character
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
                  ความ ‘ละเมียด’ คือหัวใจของเรา ตั้งแต่การหมัก การกลั่น ไปจนถึงการพักในถังและการเบลนด์
                  เพื่อให้ทุกแก้วมีบาลานซ์และมิติ กลิ่นหอมสะอาด ดื่มง่ายแต่ไม่ธรรมดา
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* VALUES */}
        <Box sx={{ mt: { xs: 6, md: 10 } }}>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ color: brand?.navy || theme.palette.text.primary, mb: 2 }}
          >
            What We Value
          </Typography>
          <Grid container spacing={2.5}>
            {[
              {
                icon: <LocalFloristOutlinedIcon />,
                title: 'Terroir & Botanicals',
                text: 'ภูมิอากาศและพืชพรรณท้องถิ่นคือตัวตนของรสชาติ',
              },
              {
                icon: <OpacityOutlinedIcon />,
                title: 'Purity',
                text: 'ความสะอาด โปร่งใส และมาตรฐานการผลิตที่เข้มงวด',
              },
              {
                icon: <WhatshotOutlinedIcon />,
                title: 'Small-Batch',
                text: 'งานฝีมือชิ้นเล็ก ควบคุมคุณภาพได้จริง',
              },
              {
                icon: <PublicOutlinedIcon />,
                title: 'Community',
                text: 'เติบโตไปพร้อมเกษตรกรและชุมชนต้นน้ำ',
              },
            ].map((v) => (
              <Grid key={v.title} item xs={12} sm={6} md={3}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 3,
                    '&:hover': { boxShadow: 3 },
                    transition: 'box-shadow .2s',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(accent, 0.18),
                      color: brand?.navy || theme.palette.text.primary,
                      mb: 1.2,
                      width: 44,
                      height: 44,
                    }}
                  >
                    {v.icon}
                  </Avatar>
                  <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                    {v.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {v.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* TIMELINE */}
        <Box sx={{ mt: { xs: 6, md: 10 } }}>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ color: brand?.navy || theme.palette.text.primary, mb: 2 }}
          >
            Journey
          </Typography>
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
            <Grid container spacing={2}>
              {[
                { year: '2019', title: 'เริ่มทดลองกลั่น', text: 'จากหม้อกลั่นเล็ก ๆ และสูตรสมุนไพรบ้าน ๆ' },
                { year: '2021', title: 'ร่วมมือชุมชน', text: 'พัฒนาวัตถุดิบกับเกษตรกรและโรงกลั่นท้องถิ่น' },
                { year: '2023', title: 'Small-Batch Line', text: 'ตั้งไลน์กลั่นทดลองแบบควบคุมคุณภาพเข้ม' },
                { year: '2025', title: 'สู่ตลาดพรีเมียม', text: 'เปิดตัวคอลเลกชันแรกพร้อมดีไซน์ใหม่' },
              ].map((t, i) => (
                <Grid key={t.year} item xs={12} md={3}>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="overline"
                      sx={{ letterSpacing: 1, color: accent, fontWeight: 900 }}
                    >
                      {t.year}
                    </Typography>
                    <Typography fontWeight={800}>{t.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.text}
                    </Typography>
                  </Stack>
                  {i < 3 && (
                    <Divider sx={{ display: { xs: 'block', md: 'none' }, my: 2 }} />
                  )}
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* FOUNDER */}
        <Box sx={{ mt: { xs: 6, md: 10 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  loading="lazy"
                  src="/assets/story-founder.jpg"
                  alt="ผู้ก่อตั้ง NABI SPIRITS"
                  sx={{ height: 300, objectFit: 'cover' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography
                variant="h5"
                fontWeight={900}
                sx={{ color: brand?.navy || theme.palette.text.primary, mb: 1 }}
              >
                ทีมเล็กที่เชื่อในรายละเอียด
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                เราเป็นทีมเล็ก ๆ ที่หมกมุ่นกับดีเทล ตั้งแต่ค่าความสะอาดของน้ำ
                อุณหภูมิการหมัก ไปจนถึงคาแรกเตอร์ของถังที่ใช้พัก
                เพราะเชื่อว่าความต่างเล็ก ๆ ทำให้รสชาติ “จำได้” มากกว่า “เหมือนกัน”
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* CTA */}
        <Box
          sx={{
            mt: { xs: 8, md: 12 },
            textAlign: 'center',
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(accent, 0.2)}, ${alpha(heroEnd, 0.12)})`,
            border: '1px solid rgba(0,0,0,.06)',
          }}
        >
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ color: brand?.navy || theme.palette.text.primary, mb: 1 }}
          >
            พร้อมสัมผัสเรื่องเล่าในขวดแรกของคุณหรือยัง
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            สำรวจคอลเลกชันปัจจุบันของเรา หรืออ่านเพิ่มเติมเกี่ยวกับกระบวนการผลิต
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
            <Button
              component={Link}
              to="/products"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              aria-label="ไปที่หน้าสินค้า"
              sx={{
                bgcolor: accent,
                color: theme.palette.secondary.contrastText,
                fontWeight: 900,
                borderRadius: 999,
                px: 2.8,
                '&:hover': { bgcolor: accentHover },
              }}
            >
              Explore Products
            </Button>
            <Button
              component={Link}
              to="/our-story"
              variant="text"
              aria-label="ไปที่หน้า Our Story"
              sx={{ fontWeight: 800, color: brand?.navy || theme.palette.text.primary }}
            >
              Learn More
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
