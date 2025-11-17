import api from './axios'

// Public
export async function fetchPublicNews(params = {}) {
  const res = await api.get('/api/news', { params })
  return res.data
}

// Admin
export async function adminListNews(params = {}) {
  const res = await api.get('/api/admin/news', { params })
  return res.data
}

export async function adminCreateNews(formData) {
  const res = await api.post('/api/admin/news', formData)
  return res.data
}

export async function adminUpdateNews(id, formData) {
  const res = await api.put(`/api/admin/news/${id}`, formData)
  return res.data
}

export async function adminSoftDeleteNews(id) {
  const res = await api.delete(`/api/admin/news/${id}`)
  return res.data
}

export async function adminRestoreNews(id) {
  const res = await api.put(`/api/admin/news/${id}/restore`)
  return res.data
}

export async function adminHardDeleteNews(id) {
  const res = await api.delete(`/api/admin/news/${id}/hard`)
  return res.data
}

