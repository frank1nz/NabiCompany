// src/pages/admin/AdminProducts.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Stack, Paper, Typography, Toolbar, Box, TextField, Select, MenuItem,
  IconButton, Divider, Alert, CircularProgress, Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminSoftDeleteProduct,
  adminRestoreProduct,
} from '../../lib/products';

import ProductForm from '../../components/admin-products/ProductForm';
import ProductTable from '../../components/admin-products/ProductTable';
import EditProductDialog from '../../components/admin-products/EditProductDialog';
import DeleteConfirmDialog from '../../components/admin-products/DeleteConfirmDialog';

const initialForm = {
  name: '',
  description: '',
  price: '',
  visibility: 'public',
  status: 'active',
  tags: '',
};

const BRAND = { navy: '#1C2738', gold: '#D4AF37' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  // Toolbar states
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  async function loadProducts() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await adminListProducts({ includeDeleted: true });
      setProducts(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'โหลดข้อมูลสินค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  // ---------- FILTER & SEARCH ----------
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (products || []).filter((p) => {
      const byQ =
        !needle ||
        p.name?.toLowerCase().includes(needle) ||
        p.description?.toLowerCase().includes(needle) ||
        (p.tags || []).join(',').toLowerCase().includes(needle);

      const byStatus = statusFilter === 'all' || p.status === statusFilter;
      const byVisibility = visibilityFilter === 'all' || p.visibility === visibilityFilter;
      return byQ && byStatus && byVisibility;
    });
  }, [products, q, statusFilter, visibilityFilter]);

  // ---------- CREATE ----------
  async function handleCreate({ form, files }) {
    setError('');
    setSuccess('');
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      visibility: form.visibility,
      status: form.status,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (!payload.name) {
      setSaving(false);
      setError('กรุณาระบุชื่อสินค้า');
      return false;
    }

    try {
      if (files?.length) {
        const fd = new FormData();
        fd.append('name', payload.name);
        fd.append('description', payload.description);
        fd.append('price', String(payload.price));
        fd.append('visibility', payload.visibility);
        fd.append('status', payload.status);
        payload.tags.forEach((t) => fd.append('tags[]', t));
        files.forEach((f) => fd.append('images', f));
        await adminCreateProduct(fd);
      } else {
        await adminCreateProduct(payload);
      }
      setSuccess('เพิ่มสินค้าเรียบร้อย');
      await loadProducts();
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || 'เพิ่มสินค้าไม่สำเร็จ');
      return false;
    } finally {
      setSaving(false);
    }
  }

  // ---------- EDIT ----------
  const openEdit = (product) => {
    setEditProduct(product);
    setEditOpen(true);
    setError('');
    setSuccess('');
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditProduct(null);
  };

  async function submitEdit({ form, files }) {
    if (!editProduct) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      visibility: form.visibility,
      status: form.status,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (!payload.name) {
      setSaving(false);
      setError('กรุณาระบุชื่อสินค้า');
      return;
    }

    try {
      if (files?.length) {
        const fd = new FormData();
        fd.append('name', payload.name);
        fd.append('description', payload.description);
        fd.append('price', String(payload.price));
        fd.append('visibility', payload.visibility);
        fd.append('status', payload.status);
        payload.tags.forEach((t) => fd.append('tags[]', t));
        files.forEach((f) => fd.append('images', f));
        await adminUpdateProduct(editProduct._id, fd);
      } else {
        await adminUpdateProduct(editProduct._id, payload);
      }
      setSuccess('อัปเดตสินค้าเรียบร้อย');
      closeEdit();
      loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || 'อัปเดตสินค้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  // ---------- STATUS ----------
  async function toggleStatus(product) {
    setSaving(true);
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await adminUpdateProduct(product._id, { status: nextStatus });
      await loadProducts();
      setSuccess('อัปเดตสถานะสินค้าแล้ว');
    } catch (err) {
      setError(err?.response?.data?.message || 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  // ---------- SOFT DELETE / RESTORE ----------
  const askDelete = (product) => {
    setConfirmTarget(product);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };
  async function confirmDelete() {
    if (!confirmTarget) return;
    setSaving(true);
    try {
      if (confirmTarget.deletedAt) {
        await adminRestoreProduct(confirmTarget._id);
      } else {
        await adminSoftDeleteProduct(confirmTarget._id);
      }
      setSuccess(confirmTarget.deletedAt ? 'กู้คืนสินค้าแล้ว' : 'ลบสินค้า (Soft delete) แล้ว');
      closeConfirm();
      loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || 'ไม่สามารถดำเนินการได้');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      {/* Header / Filters */}
      <Paper sx={{ p: 0, overflow: 'hidden' }}>
        <Toolbar
          sx={{
            px: 2, py: 1.5, gap: 1.5,
            justifyContent: 'space-between',
            bgcolor: 'rgba(28,39,56,0.03)',
            borderBottom: '1px solid rgba(0,0,0,.06)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6" fontWeight={900} sx={{ color: BRAND.navy }}>
              รายการสินค้า
            </Typography>
            <Divider flexItem orientation="vertical" />
            <TextField
              size="small"
              placeholder="ค้นหาชื่อ/คำอธิบาย/แท็ก"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ minWidth: 260 }}
            />
            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">ทุกสถานะ</MenuItem>
              <MenuItem value="active">active</MenuItem>
              <MenuItem value="inactive">inactive</MenuItem>
            </Select>
            <Select
              size="small"
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">ทุก visibility</MenuItem>
              <MenuItem value="public">public</MenuItem>
              <MenuItem value="hidden">hidden</MenuItem>
            </Select>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={loadProducts} disabled={loading} title="รีเฟรช">
              {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Stack>
        </Toolbar>

        <Box sx={{ px: 2, py: 2 }}>
          {!!success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {!!error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* LIST */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ProductTable
                products={filtered}
                onToggleStatus={toggleStatus}
                onEdit={openEdit}
                onAskDelete={askDelete}
              />
            )}
          </Paper>
        </Box>
      </Paper>

      {/* CREATE */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <AddRoundedIcon />
          <Typography variant="h6">เพิ่มสินค้า</Typography>
          {saving && (
            <Box sx={{ ml: 1 }}><CircularProgress size={16} /></Box>
          )}
        </Stack>

        <ProductForm
          initialForm={initialForm}
          onSubmit={handleCreate}
          success={success}
          error={error}
          onClearMessages={() => {
            setError('');
            setSuccess('');
          }}
        />
      </Paper>

      {/* EDIT DIALOG */}
      <EditProductDialog
        open={editOpen}
        product={editProduct}
        onClose={closeEdit}
        onSubmit={submitEdit}
      />

      {/* CONFIRM DIALOG */}
      <DeleteConfirmDialog
        open={confirmOpen}
        product={confirmTarget}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}
