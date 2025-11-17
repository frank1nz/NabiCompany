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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { darken } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { useEffect, useState } from 'react';
import { useCart } from '../store/cartStore';
import logo from '../assets/nabi_logo_no_bg.png';

export default function Navbar() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  // 📱 เมนูสำหรับจอเล็ก (มือถือ / แท็บเล็ต)
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen((v) => !v);
  const closeMobile = () => setMobileOpen(false);

  // ปิดเมนูมือถืออัตโนมัติเมื่อขยายหน้าจอเป็นเดสก์ท็อป
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);

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
        <Toolbar
          disableGutters
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: { xs: 56, md: 64 },
          }}
        >
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

          {/* 🧭 แถบเมนูนำทาง / ปุ่มเมนูมือถือ */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexGrow: 1,
            }}
          >
            {/* เดสก์ท็อป: เมนูเรียงเป็นแถว */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              {/* เมนูหลัก */}
              <NavBtn to="/">Home</NavBtn>
              <NavBtn to="/products">Products</NavBtn>
              <NavBtn to="/contact">Contact</NavBtn>

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
                    <MenuItem
                      component={Link}
                      to="/admin/news"
                      onClick={handleClose}
                    >
                      News
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

            {/* มือถือ / แท็บเล็ต: แสดงปุ่มเมนู */}
            <IconButton
              onClick={toggleMobile}
              sx={{
                display: { xs: 'flex', md: 'none' },
                ml: 1,
                color: brand?.navy || theme.palette.text.primary,
              }}
              aria-label="เปิดเมนูนำทาง"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>

        {/* 📱 เมนูแบบ dropdown สำหรับจอเล็ก */}
        {isMobile && mobileOpen && (
          <Box
            sx={{
              px: 2,
              pb: 1.5,
              pt: 0.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.25,
            }}
          >
            <NavBtn
              to="/"
              onClick={closeMobile}
              sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
            >
              Home
            </NavBtn>
            <NavBtn
              to="/products"
              onClick={closeMobile}
              sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
            >
              Products
            </NavBtn>
            <NavBtn
              to="/contact"
              onClick={closeMobile}
              sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
            >
              Contact
            </NavBtn>

            {isLoggedIn && !isAdmin && (
              <>
                {isVerified && (
                  <NavBtn
                    to="/orders"
                    onClick={closeMobile}
                    sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    {`Cart${cartQuantity > 0 ? ` (${cartQuantity})` : ''}`}
                  </NavBtn>
                )}
                {selfId && (
                  <NavBtn
                    to={`/me/${selfId}`}
                    onClick={closeMobile}
                    sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Profile
                  </NavBtn>
                )}
              </>
            )}

            {isAdmin && (
              <>
                {selfId && (
                  <NavBtn
                    to={`/me/${selfId}`}
                    onClick={closeMobile}
                    sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Profile
                  </NavBtn>
                )}
                <NavBtn
                  to="/admin/kyc"
                  onClick={closeMobile}
                  sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  Admin KYC
                </NavBtn>
                <NavBtn
                  to="/admin/orders"
                  onClick={closeMobile}
                  sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  Admin Orders
                </NavBtn>
                <NavBtn
                  to="/admin/products"
                  onClick={closeMobile}
                  sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  Admin Products
                </NavBtn>
                <NavBtn
                  to="/admin/news"
                  onClick={closeMobile}
                  sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  Admin News
                </NavBtn>
              </>
            )}

            {!isLoggedIn ? (
              <>
                <NavBtn
                  to="/login"
                  onClick={closeMobile}
                  sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  Login
                </NavBtn>
                <NavBtn
                  to="/register"
                  onClick={closeMobile}
                  sx={{ width: '100%', justifyContent: 'flex-start', borderRadius: 2 }}
                >
                  Register
                </NavBtn>
              </>
            ) : (
              <Button
                onClick={() => {
                  closeMobile();
                  logout();
                }}
                variant="contained"
                sx={{
                  mt: 0.5,
                  bgcolor: accent,
                  color: theme.palette.secondary.contrastText,
                  borderRadius: 2,
                  fontWeight: 800,
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 0.9,
                  fontSize: 13,
                  textTransform: 'none',
                  '&:hover': { bgcolor: darken(accent, 0.08) },
                  boxShadow: '0 3px 8px rgba(0,0,0,.08)',
                }}
                fullWidth
              >
                LOGOUT
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </AppBar>
  );
}

/* 🔹 ปุ่มลิงก์นำทางแบบ Reusable (ใช้ซ้ำได้ทุกที่) */
function NavBtn({ to, children, sx: sxOverride, onClick }) {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;

  const baseSx = {
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
  };

  return (
    <Button
      component={NavLink}
      to={to}
      onClick={onClick}
      sx={{ ...baseSx, ...(sxOverride || {}) }}
    >
      {children}
    </Button>
  );
}
