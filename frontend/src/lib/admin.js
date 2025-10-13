import api from './axios'

export async function fetchPendingKyc() {
  const res = await api.get('/admin/kyc/pending')
  return res.data
}

export async function approveKyc(userId) {
  const res = await api.put(`/admin/kyc/${userId}/approve`)
  return res.data
}

export async function rejectKyc(userId, note) {
  const res = await api.put(`/admin/kyc/${userId}/reject`, { note })
  return res.data
}

export async function fetchUserStats() {
  const res = await api.get('/admin/stats/users')
  return res.data
}

export async function fetchOrderStats() {
  const res = await api.get('/admin/stats/orders')
  return res.data
}
