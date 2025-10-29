// src/components/Navbar.jsx
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import { darken } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useEffect, useState } from 'react';
import { useCart } from '../store/cartStore';
import logo from '../assets/nabi_logo_no_bg.png';

export default function Navbar() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;
  const auth = useAuth() || {};
  const user = auth.user || null;
  const logout = auth.logout || (() => { });

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';
  const selfId = user?.id || user?._id;

  // ✅ ตรวจว่า KYC ผ่านหรือยัง
  const isVerified =
    user?.isVerified === true ||
    user?.verified === true ||
    user?.kycStatus === 'approved' ||
    user?.canOrderViaLine === true;

  const loadCart = useCart((state) => state.loadCart);
  const cartQuantity = useCart((state) => Number(state.totals.quantity || 0));
  const cartLastUpdated = useCart((state) => state.lastUpdated);

  useEffect(() => {
    if (!isLoggedIn || isAdmin) return;
    if (cartLastUpdated !== null) return;
    loadCart()?.catch(() => { });
  }, [isLoggedIn, isAdmin, cartLastUpdated, loadCart]);

  // 🔽 สำหรับเมนู admin dropdown
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: 'blur(12px) saturate(160%)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        zIndex: 1000,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          mx: 'auto',
          my: 1,
          px: { xs: 2, md: 3 },
          py: 0.6,
          borderRadius: 999,
          maxWidth: '98%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 4px 12px rgba(0,0,0,.03)',
        }}
      >
        <Toolbar disableGutters sx={{ width: '100%' }}>
          {/* 🌿 โลโก้แบรนด์ */}

          <Typography

            variant="h6"
            paddingRight={1}
            component={Link}
            to="/"
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,.25)',
                display: 'grid',
                placeItems: 'center',
                backdropFilter: 'blur(2px)',
                overflow: 'hidden',
              }}
            >
              <img
                src={logo}
                alt="Nabi Spirits Logo"
                style={{ width: '80%', height: '80%', objectFit: 'contain' }}
              />
            </Box>
          </Typography>

          {/* 🧭 แถบเมนูนำทาง */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* เมนูหลัก */}
            <NavBtn to="/">Home</NavBtn>
            <NavBtn to="/products">Products</NavBtn>

            {/* 🧍 สำหรับผู้ใช้ทั่วไป */}
            {isLoggedIn && !isAdmin && (
              <>
                {isVerified && (
                  <NavBtn to="/orders">
                    {`Cart${cartQuantity > 0 ? ` (${cartQuantity})` : ''}`}
                  </NavBtn>
                )}
                {selfId && <NavBtn to={`/me/${selfId}`}>Profile</NavBtn>}
              </>
            )}

            {/* 🛠 สำหรับแอดมิน */}
            {isAdmin && (
              <>
                {selfId && <NavBtn to={`/me/${selfId}`}>Profile</NavBtn>}

                <Tooltip title="Admin Menu">
                  <IconButton
                    onClick={handleOpen}
                    size="small"
                    aria-controls={open ? 'admin-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    sx={{
                      color: brand?.navy || theme.palette.text.primary,
                      '&:hover': { color: accent },
                      transition: 'color 0.2s',
                    }}
                  >
                    <AdminPanelSettingsIcon />
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* เมนูสำหรับผู้ดูแลระบบ */}
                <Menu
                  id="admin-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    component={Link}
                    to="/admin/kyc"
                    onClick={handleClose}
                  >
                    KYC
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/admin/orders"
                    onClick={handleClose}
                  >
                    Orders
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/admin/products"
                    onClick={handleClose}
                  >
                    Products
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* 🔐 ปุ่มล็อกอิน / ล็อกเอาท์ */}
            {!isLoggedIn ? (
              <>
                <NavBtn to="/login">Login</NavBtn>
                <NavBtn to="/register">Register</NavBtn>
              </>
            ) : (
              <Button
                onClick={logout}
                variant="contained"
                sx={{
                  bgcolor: accent,
                  color: theme.palette.secondary.contrastText,
                  borderRadius: 999,
                  fontWeight: 800,
                  px: 2.5,
                  py: 0.8,
                  fontSize: 13,
                  '&:hover': { bgcolor: darken(accent, 0.08) },
                  boxShadow: '0 3px 8px rgba(0,0,0,.1)',
                }}
              >
                LOGOUT
              </Button>
            )}
          </Box>
        </Toolbar>
      </Paper>
    </AppBar>
  );
}

/* 🔹 ปุ่มลิงก์นำทางแบบ Reusable (ใช้ซ้ำได้ทุกที่) */
function NavBtn({ to, children }) {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;

  return (
    <Button
      component={NavLink}
      to={to}
      sx={{
        px: 1.5,
        fontWeight: 800,
        color: brand?.navy || theme.palette.text.primary,
        opacity: 0.85,
        fontSize: 14,
        textTransform: 'none',
        transition: 'color 0.25s, opacity 0.25s',
        position: 'relative',
        '&:hover': { color: accent, opacity: 1 },
        '&.active': { color: accent, opacity: 1 },
        '&.active::after': {
          content: '""',
          position: 'absolute',
          bottom: 3,
          left: '18%',
          right: '18%',
          height: 2,
          borderRadius: 1,
          backgroundColor: accent,
        },
      }}
    >
      {children}
    </Button>
  );
}
