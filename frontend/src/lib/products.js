import api from './axios'

export async function fetchPublicProducts(params = {}) {
  const res = await api.get('/products', { params })
  return res.data
}

export async function fetchProductById(id) {
  const res = await api.get(`/products/${id}`)
  return res.data
}

// Admin endpoints
export async function adminListProducts(params = {}) {
  const res = await api.get('/admin/products', { params })
  return res.data
}

export async function adminCreateProduct(payload) {
  const res = await api.post('/admin/products', payload)
  return res.data
}

export async function adminUpdateProduct(id, payload) {
  const res = await api.put(`/admin/products/${id}`, payload)
  return res.data
}

export async function adminSoftDeleteProduct(id) {
  const res = await api.delete(`/admin/products/${id}`)
  return res.data
}

export async function adminRestoreProduct(id) {
  const res = await api.put(`/admin/products/${id}/restore`)
  return res.data
}
