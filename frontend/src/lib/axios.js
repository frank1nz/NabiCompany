import axios from 'axios'


const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE })


api.interceptors.request.use((config) => {
const token = localStorage.getItem('token')
if (token) {
config.headers = config.headers || {}
config.headers.Authorization = `Bearer ${token}`
}
return config
})


api.interceptors.response.use(
(res) => res,
(err) => Promise.reject(err) // ❗️อย่า redirect ที่นี่ ให้ผู้เรียกตัดสินใจเอง
)


export default api