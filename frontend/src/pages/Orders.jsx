import { useEffect, useMemo, useState } from 'react'
import {
  Paper,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Chip,
} from '@mui/material'
import { fetchMyOrders, createLineOrder } from '../lib/orders'
import { fetchPublicProducts } from '../lib/products'
import { useAuth } from '../store/authStore'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canOrder = user?.canOrderViaLine || user?.isVerified

  useEffect(() => {
    fetchMyOrders().then(setOrders).catch(console.error)
    fetchPublicProducts({ status: 'active' }).then(setProducts).catch(console.error)
  }, [])

  const totalPreview = useMemo(() => {
    return products.reduce((acc, product) => {
      const qty = Number(quantities[product._id] || 0)
      if (!qty) return acc
      return acc + (product.price || 0) * qty
    }, 0)
  }, [products, quantities])

  const resetForm = () => {
    setQuantities({})
    setNote('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!canOrder) {
      setError('บัญชียังไม่ผ่านการยืนยัน ไม่สามารถสั่งซื้อได้')
      return
    }

    const items = Object.entries(quantities)
      .map(([productId, quantity]) => ({
        productId,
        quantity: Number(quantity),
      }))
      .filter((item) => item.quantity > 0)

    if (!items.length) {
      setError('กรุณาเลือกสินค้าอย่างน้อย 1 รายการ')
      return
    }

    setLoading(true)
    try {
      await createLineOrder({
        items,
        note,
        lineUserId: user?.profile?.lineId,
      })
      setSuccess('ส่งคำสั่งซื้อเรียบร้อย! ทีมงานจะยืนยันผ่าน LINE')
      resetForm()
      const latest = await fetchMyOrders()
      setOrders(latest)
    } catch (err) {
      setError(err?.response?.data?.message || 'ไม่สามารถสร้างคำสั่งซื้อได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" mb={2}>สร้างคำสั่งซื้อผ่าน LINE</Typography>
        {!canOrder && (
          <Typography color="warning.main" mb={2}>
            ต้องผ่าน KYC ก่อนจึงจะสามารถสั่งซื้อได้
          </Typography>
        )}
        <Stack spacing={2}>
          <Typography variant="subtitle1">เลือกรายการสินค้า</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>สินค้า</TableCell>
                <TableCell>ราคา (฿)</TableCell>
                <TableCell width={160}>จำนวน</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price ?? '-'}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={quantities[product._id] ?? ''}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [product._id]: e.target.value,
                        }))
                      }
                      inputProps={{ min: 0 }}
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TextField
            label="หมายเหตุถึงทีมงาน"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={3}
            placeholder="ระบุ LINE ID หรือรายละเอียดอื่น ๆ"
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">
              ยอดโดยประมาณ: ฿ {totalPreview.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'กำลังส่ง...' : 'ส่งคำสั่งซื้อ'}
            </Button>
          </Box>

          {success && <Typography color="success.main">{success}</Typography>}
          {error && <Typography color="error.main">{error}</Typography>}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>ประวัติคำสั่งซื้อ</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>รหัส</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>ยอดรวม</TableCell>
              <TableCell>จำนวนสินค้า</TableCell>
              <TableCell>อัปเดตล่าสุด</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  <Chip label={order.status} size="small" color="primary" />
                </TableCell>
                <TableCell>฿ {Number(order.total || 0).toLocaleString()}</TableCell>
                <TableCell>{order.items?.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                <TableCell>{new Date(order.updatedAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {!orders.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  ยังไม่มีคำสั่งซื้อ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  )
}
