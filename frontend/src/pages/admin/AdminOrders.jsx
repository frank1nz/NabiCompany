import { useEffect, useState } from 'react'
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Select,
  Button,
  Stack,
  Chip,
} from '@mui/material'
import { adminListOrders, adminUpdateOrderStatus } from '../../lib/orders'

const STATUS_OPTIONS = ['pending', 'confirmed', 'rejected', 'fulfilled', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [noteDraft, setNoteDraft] = useState({})
  const [statusDraft, setStatusDraft] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadOrders = () =>
    adminListOrders()
      .then((data) => {
        setOrders(data)
        setError('')
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'โหลดคำสั่งซื้อไม่สำเร็จ')
      })

  useEffect(() => {
    loadOrders()
  }, [])

  async function handleUpdate(orderId) {
    setError('')
    setSuccess('')
    try {
      await adminUpdateOrderStatus(orderId, {
        status: statusDraft[orderId],
        adminNote: noteDraft[orderId],
      })
      setSuccess('อัปเดตคำสั่งซื้อเรียบร้อย')
      loadOrders()
    } catch (err) {
      setError(err?.response?.data?.message || 'อัปเดตไม่ได้')
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>จัดการคำสั่งซื้อจาก LINE</Typography>
      {success && <Typography color="success.main" mb={2}>{success}</Typography>}
      {error && <Typography color="error.main" mb={2}>{error}</Typography>}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>คำสั่งซื้อ</TableCell>
            <TableCell>ลูกค้า</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell>ยอดรวม</TableCell>
            <TableCell>Note</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="body2">{order.id}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="body2">{order.user?.name || '-'}</Typography>
                  <Typography variant="caption">{order.user?.email}</Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Chip label={order.status} size="small" />
                <Select
                  size="small"
                  sx={{ mt: 1, minWidth: 140 }}
                  value={statusDraft[order.id] ?? order.status}
                  onChange={(e) =>
                    setStatusDraft((prev) => ({ ...prev, [order.id]: e.target.value }))
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>฿ {Number(order.total || 0).toLocaleString()}</TableCell>
              <TableCell width={220}>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="หมายเหตุ"
                  value={noteDraft[order.id] ?? order.adminNote ?? ''}
                  onChange={(e) =>
                    setNoteDraft((prev) => ({ ...prev, [order.id]: e.target.value }))
                  }
                />
              </TableCell>
              <TableCell align="right">
                <Button variant="contained" size="small" onClick={() => handleUpdate(order.id)}>
                  บันทึก
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!orders.length && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                ยังไม่มีคำสั่งซื้อ
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}
