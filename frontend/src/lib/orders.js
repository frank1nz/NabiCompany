import api from './axios'

export async function createLineOrder(payload) {
  const res = await api.post('/orders/line', payload)
  return res.data
}

export async function fetchMyOrders() {
  const res = await api.get('/orders/me')
  return res.data
}

export async function adminListOrders() {
  const res = await api.get('/admin/orders')
  return res.data
}

export async function adminUpdateOrderStatus(id, payload) {
  const res = await api.patch(`/admin/orders/${id}`, payload)
  return res.data
}
