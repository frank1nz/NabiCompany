// Navbar.jsx
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Divider, Tooltip } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { Link } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import { useState } from 'react'

export default function Navbar() {
  const auth = useAuth() || {}
  const user = auth.user || null
  const logout = auth.logout || (() => {})

  const isLoggedIn = !!user
  const isAdmin = user?.role === 'admin'
  const selfId = user?.id || user?._id

  const isVerified =
    user?.isVerified === true ||
    user?.verified === true ||
    user?.kycStatus === 'approved' ||
    user?.canOrderViaLine === true

  // ✅ ไม่มี generic ใน .jsx
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleOpen = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Nabi {user?.role ? `(${user.role})` : ''}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button component={Link} to="/">Home</Button>
          <Button component={Link} to="/products">Products</Button>

          {/* user (non-admin) */}
          {isLoggedIn && !isAdmin && (
            <>
              {isVerified && <Button component={Link} to="/orders">Orders</Button>}
              {selfId && <Button component={Link} to={`/me/${selfId}`}>Profile</Button>}
            </>
          )}

          {/* admin dropdown (ไม่มี Orders ฝั่ง client) */}
          {isAdmin && (
            <>
              {selfId && <Button component={Link} to={`/me/${selfId}`}>Profile</Button>}
              <Tooltip title="Admin menu">
                <IconButton onClick={handleOpen} size="small" aria-controls={open ? 'admin-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined}>
                  <AdminPanelSettingsIcon />
                  <KeyboardArrowDownIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                id="admin-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem component={Link} to="/admin/kyc" onClick={handleClose}>KYC</MenuItem>
                <MenuItem component={Link} to="/admin/orders" onClick={handleClose}>Orders</MenuItem>
                <MenuItem component={Link} to="/admin/products" onClick={handleClose}>Products</MenuItem>
                
              </Menu>
            </>
          )}

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
