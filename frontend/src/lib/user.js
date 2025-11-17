import api from './axios'

export async function getUserById(id) {
  const res = await api.get(`/users/${id}`)
  return res.data
}

export async function updateUserProfile(id, payload) {
  const res = await api.patch(`/users/${id}`, payload)
  return res.data
}
