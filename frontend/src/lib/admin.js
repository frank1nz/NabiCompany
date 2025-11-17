import api from './axios'

export async function fetchPendingKyc() {
  const res = await api.get('/api/admin/kyc/pending')
  return res.data
}

export async function approveKyc(userId) {
  const res = await api.put(`/api/admin/kyc/${userId}/approve`)
  return res.data
}

export async function rejectKyc(userId, note) {
  const res = await api.put(`/api/admin/kyc/${userId}/reject`, { note })
  return res.data
}

export async function fetchUserStats() {
  const res = await api.get('/api/admin/stats/users')
  return res.data
}

export async function fetchOrderStats() {
  const res = await api.get('/api/admin/stats/orders')
  return res.data
}
