import { create } from 'zustand'
import { me } from '../lib/auth'


export const useAuth = create((set) => ({
user: null,
loading: false, // หน้า public แสดงได้ทันที


setToken: (token) => {
localStorage.setItem('token', token)
},


fetchMe: async () => {
if (!localStorage.getItem('token')) {
set({ user: null, loading: false })
return
}
set({ loading: true })
try {
const data = await me()
set({ user: data, loading: false })
} catch {
set({ user: null, loading: false })
}
},


logout: () => {
localStorage.removeItem('token')
set({ user: null, loading: false })
window.location.href = '/login'
},
}))