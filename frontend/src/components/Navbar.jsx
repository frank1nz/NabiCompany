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
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useEffect, useState } from 'react';
import { useCart } from '../store/cartStore';

// 🎨 สีประจำแบรนด์
const BRAND = { navy: '#1C2738', gold: '#D4AF37' };

export default function Navbar() {
  const auth = useAuth() || {};
  const user = auth.user || null;
  const logout = auth.logout || (() => {});

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
    loadCart()?.catch(() => {});
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
            component={Link}
            to="/"
            sx={{
              fontWeight: 900,
              color: BRAND.navy,
              textDecoration: 'none',
              letterSpacing: 0.6,
              flexGrow: 1,
              '&:hover': { color: BRAND.gold },
              transition: 'color 0.25s',
            }}
          >
            {/* ❌ เดิม: NABI SPIRITS (user)
                ✅ ใหม่: แสดงเฉพาะชื่อแบรนด์เท่านั้น */}
            NABI SPIRITS
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
                      color: BRAND.navy,
                      '&:hover': { color: BRAND.gold },
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
                  bgcolor: BRAND.gold,
                  color: '#111',
                  borderRadius: 999,
                  fontWeight: 800,
                  px: 2.5,
                  py: 0.8,
                  fontSize: 13,
                  '&:hover': { bgcolor: '#C6A132' },
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
  return (
    <Button
      component={NavLink}
      to={to}
      sx={{
        px: 1.5,
        fontWeight: 800,
        color: BRAND.navy,
        opacity: 0.85,
        fontSize: 14,
        textTransform: 'none',
        transition: 'color 0.25s, opacity 0.25s',
        position: 'relative',
        '&:hover': { color: BRAND.gold, opacity: 1 },
        '&.active': { color: BRAND.gold, opacity: 1 },
        '&.active::after': {
          content: '""',
          position: 'absolute',
          bottom: 3,
          left: '18%',
          right: '18%',
          height: 2,
          borderRadius: 1,
          backgroundColor: BRAND.gold,
        },
      }}
    >
      {children}
    </Button>
  );
}
