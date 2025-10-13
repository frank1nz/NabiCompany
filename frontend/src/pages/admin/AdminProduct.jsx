import { useEffect, useState } from 'react'
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  TextField,
  Button,
  Chip,
} from '@mui/material'
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminSoftDeleteProduct,
  adminRestoreProduct,
} from '../../lib/products'

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
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProducts = () =>
    adminListProducts({ includeDeleted: true })
      .then((data) => {
        setProducts(data)
        setError('')
      })
      .catch((err) => setError(err?.response?.data?.message || 'โหลดข้อมูลสินค้าไม่สำเร็จ'))

  useEffect(() => {
    loadProducts()
  }, [])

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        visibility: form.visibility,
        status: form.status,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      }
      if (!payload.name) {
        setError('กรุณาระบุชื่อสินค้า')
        return
      }
      await adminCreateProduct(payload)
      setForm(initialForm)
      setSuccess('เพิ่มสินค้าเรียบร้อย')
      loadProducts()
    } catch (err) {
      setError(err?.response?.data?.message || 'เพิ่มสินค้าไม่สำเร็จ')
    }
  }

  async function toggleStatus(product) {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active'
    await adminUpdateProduct(product._id, { status: nextStatus })
    loadProducts()
  }

  async function toggleDeleted(product) {
    if (product.deletedAt) {
      await adminRestoreProduct(product._id)
    } else {
      await adminSoftDeleteProduct(product._id)
    }
    loadProducts()
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }} component="form" onSubmit={handleCreate}>
        <Typography variant="h6" mb={2}>เพิ่มสินค้า</Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <TextField
              label="ชื่อสินค้า"
              value={form.name}
              onChange={handleChange('name')}
              fullWidth
            />
            <TextField
              label="ราคา (บาท)"
              type="number"
              value={form.price}
              onChange={handleChange('price')}
              sx={{ minWidth: 180 }}
            />
          </Stack>
          <TextField
            label="รายละเอียด"
            value={form.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
          />
          <TextField
            label="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)"
            value={form.tags}
            onChange={handleChange('tags')}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <TextField
              label="Visibility"
              value={form.visibility}
              onChange={handleChange('visibility')}
              placeholder="public / hidden"
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="Status"
              value={form.status}
              onChange={handleChange('status')}
              placeholder="active / inactive"
              sx={{ minWidth: 160 }}
            />
          </Stack>
          {success && <Typography color="success.main">{success}</Typography>}
          {error && <Typography color="error.main">{error}</Typography>}
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
            เพิ่มสินค้า
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>รายการสินค้า</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ชื่อ</TableCell>
              <TableCell>ราคา</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>Visibility</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>฿ {Number(product.price || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={product.status}
                    size="small"
                    color={product.status === 'active' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{product.visibility}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {(product.tags || []).map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => toggleStatus(product)}
                    >
                      {product.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="small"
                      color={product.deletedAt ? 'success' : 'error'}
                      variant="contained"
                      onClick={() => toggleDeleted(product)}
                    >
                      {product.deletedAt ? 'Restore' : 'Soft Delete'}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!products.length && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  ยังไม่มีสินค้า
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  )
}
