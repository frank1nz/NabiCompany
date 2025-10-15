import { useEffect, useState } from 'react'
import { Stack, Paper, Typography } from '@mui/material'
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminSoftDeleteProduct,
  adminRestoreProduct,
} from '../../lib/products'
import ProductForm from '../../components/admin-products/ProductForm'
import ProductTable from '../../components/admin-products/ProductTable'
import EditProductDialog from '../../components/admin-products/EditProductDialog'
import DeleteConfirmDialog from '../../components/admin-products/DeleteConfirmDialog'

const initialForm = {
  name: '',
  description: '',
  price: '',
  visibility: 'public',
  status: 'active',
  tags: '',
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)

  const loadProducts = () =>
    adminListProducts({ includeDeleted: true })
      .then((data) => {
        setProducts(data || [])
        setError('')
      })
      .catch((err) =>
        setError(err?.response?.data?.message || 'โหลดข้อมูลสินค้าไม่สำเร็จ')
      )

  useEffect(() => {
    loadProducts()
  }, [])

  // ---------- CREATE ----------
  async function handleCreate({ form, files }) {
    setError('')
    setSuccess('')

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
    }
    if (!payload.name) {
      setError('กรุณาระบุชื่อสินค้า')
      return false
    }

    try {
      if (files?.length) {
        const fd = new FormData()
        fd.append('name', payload.name)
        fd.append('description', payload.description)
        fd.append('price', String(payload.price))
        fd.append('visibility', payload.visibility)
        fd.append('status', payload.status)
        payload.tags.forEach((t) => fd.append('tags[]', t))
        files.forEach((f) => fd.append('images', f))
        await adminCreateProduct(fd)
      } else {
        await adminCreateProduct(payload)
      }
      setSuccess('เพิ่มสินค้าเรียบร้อย')
      await loadProducts()
      return true
    } catch (err) {
      setError(err?.response?.data?.message || 'เพิ่มสินค้าไม่สำเร็จ')
      return false
    }
  }

  // ---------- EDIT ----------
  const openEdit = (product) => {
    setEditProduct(product)
    setEditOpen(true)
    setError('')
    setSuccess('')
  }
  const closeEdit = () => {
    setEditOpen(false)
    setEditProduct(null)
  }

  async function submitEdit({ form, files }) {
    if (!editProduct) return
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
    }
    if (!payload.name) {
      setError('กรุณาระบุชื่อสินค้า')
      return
    }

    try {
      if (files?.length) {
        const fd = new FormData()
        fd.append('name', payload.name)
        fd.append('description', payload.description)
        fd.append('price', String(payload.price))
        fd.append('visibility', payload.visibility)
        fd.append('status', payload.status)
        payload.tags.forEach((t) => fd.append('tags[]', t))
        files.forEach((f) => fd.append('images', f))
        await adminUpdateProduct(editProduct._id, fd)
      } else {
        await adminUpdateProduct(editProduct._id, payload)
      }
      setSuccess('อัปเดตสินค้าเรียบร้อย')
      closeEdit()
      loadProducts()
    } catch (err) {
      setError(err?.response?.data?.message || 'อัปเดตสินค้าไม่สำเร็จ')
    }
  }

  // ---------- STATUS ----------
  async function toggleStatus(product) {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active'
    await adminUpdateProduct(product._id, { status: nextStatus })
    loadProducts()
  }

  // ---------- SOFT DELETE / RESTORE ----------
  const askDelete = (product) => {
    setConfirmTarget(product)
    setConfirmOpen(true)
  }
  const closeConfirm = () => {
    setConfirmOpen(false)
    setConfirmTarget(null)
  }
  async function confirmDelete() {
    if (!confirmTarget) return
    if (confirmTarget.deletedAt) {
      await adminRestoreProduct(confirmTarget._id)
    } else {
      await adminSoftDeleteProduct(confirmTarget._id)
    }
    closeConfirm()
    loadProducts()
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>เพิ่มสินค้า</Typography>
        <ProductForm
          initialForm={initialForm}
          onSubmit={handleCreate}
          success={success}
          error={error}
          onClearMessages={() => {
            setError('')
            setSuccess('')
          }}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>รายการสินค้า</Typography>
        <ProductTable
          products={products}
          onToggleStatus={toggleStatus}
          onEdit={openEdit}
          onAskDelete={askDelete}
        />
      </Paper>

      <EditProductDialog
        open={editOpen}
        product={editProduct}
        onClose={closeEdit}
        onSubmit={submitEdit}
      />

      <DeleteConfirmDialog
        open={confirmOpen}
        product={confirmTarget}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
      />
    </Stack>
  )
}
