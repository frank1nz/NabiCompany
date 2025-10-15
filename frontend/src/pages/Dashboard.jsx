// src/pages/Dashboard.jsx
import { Typography, Paper, Box, Stack, Divider } from '@mui/material'
import { useAuth } from '../store/authStore'

const BRAND = { navy: '#1C2738', gold: '#D4AF37' }

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(800px 400px at 10% 10%, rgba(212,175,55,.08), transparent 70%), radial-gradient(800px 400px at 90% 90%, rgba(28,39,56,.06), transparent 70%)',
        py: { xs: 6, md: 10 },
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 720,
          mx: 'auto',
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          textAlign: 'center',
          border: '1px solid rgba(0,0,0,.06)',
          boxShadow: '0 8px 24px rgba(0,0,0,.06)',
        }}
      >
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{
            color: BRAND.navy,
            mb: 2,
            fontFamily: '"Playfair Display", serif',
          }}
        >
          Welcome{user?.name ? `, ${user.name}` : ''}
        </Typography>

        <Divider
          sx={{
            width: 60,
            height: 4,
            bgcolor: BRAND.gold,
            mx: 'auto',
            mb: 3,
            borderRadius: 2,
          }}
        />

        <Stack spacing={2}>
          <Typography variant="body1" color="text.secondary">
            Use the top menu to manage your account and business features.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admins can review <strong>Orders</strong>, <strong>Products</strong>, and <strong>KYC</strong> requests.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Regular users can track their <strong>orders</strong> and update personal details.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}
