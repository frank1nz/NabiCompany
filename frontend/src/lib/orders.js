import api from './axios'

export async function fetchCart() {
  const res = await api.get('/api/orders/cart')
  return res.data
}

export async function addCartItem(payload) {
  const res = await api.post('/api/orders/cart/items', payload)
  return res.data
}

export async function updateCartItem(productId, payload) {
  const res = await api.patch(`/api/orders/cart/items/${productId}`, payload)
  return res.data
}

export async function removeCartItem(productId) {
  const res = await api.delete(`/api/orders/cart/items/${productId}`)
  return res.data
}

export async function clearCart() {
  const res = await api.delete('/api/orders/cart')
  return res.data
}

export async function checkoutCart(payload) {
  const res = await api.post('/api/orders/cart/checkout', payload)
  return res.data
}

export async function fetchMyOrders() {
  const res = await api.get('/api/orders/me')
  return res.data
}

export async function adminListOrders() {
  const res = await api.get('/api/admin/orders')
  return res.data
}

export async function adminUpdateOrderStatus(id, payload) {
  const res = await api.patch(`/api/admin/orders/${id}`, payload)
  return res.data
}
