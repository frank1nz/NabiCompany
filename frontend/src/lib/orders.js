import api from './axios'

export async function fetchCart() {
  const res = await api.get('/orders/cart')
  return res.data
}

export async function addCartItem(payload) {
  const res = await api.post('/orders/cart/items', payload)
  return res.data
}

export async function updateCartItem(productId, payload) {
  const res = await api.patch(`/orders/cart/items/${productId}`, payload)
  return res.data
}

export async function removeCartItem(productId) {
  const res = await api.delete(`/orders/cart/items/${productId}`)
  return res.data
}

export async function clearCart() {
  const res = await api.delete('/orders/cart')
  return res.data
}

export async function checkoutCart(payload) {
  const res = await api.post('/orders/cart/checkout', payload)
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
