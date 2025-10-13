import api from './axios'
export async function getUserById(id) {
const res = await api.get(`/users/${id}`)
return res.data
}