import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuth()
  const isLoggedIn = !!user
  const selfId = user?.id || user?._id  // รองรับทั้ง id และ _id

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Nabi {user?.role ? `(${user.role})` : ''}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* เมนูทุกคนเห็น */}
          <Button component={Link} to="/">Home</Button>
          <Button component={Link} to="/product">Products</Button>

          {/* เมนูเฉพาะผู้ล็อกอิน */}
          {isLoggedIn && (
            <>
              <Button component={Link} to="/status">My Status</Button>
              <Button component={Link} to="/lead">Lead Product</Button>
              <Button component={Link} to={`/me/${selfId}`}>My Profile</Button>
            </>
          )}

          {/* เมนูเฉพาะแอดมิน */}
          {user?.role === 'admin' && (
            <>
              <Button component={Link} to="/admin/kyc">KYC</Button>
              <Button component={Link} to="/admin/leads">Leads</Button>
              <Button component={Link} to="/admin/products">Manage Products</Button>
            </>
          )}

          {/* Login / Register / Logout */}
          {!isLoggedIn ? (
            <>
              <Button component={Link} to="/login">Login</Button>
              <Button component={Link} to="/register">Register</Button>
            </>
          ) : (
            <Button onClick={logout}>Logout</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
