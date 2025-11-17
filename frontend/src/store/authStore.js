import { create } from 'zustand'
import { me } from '../lib/auth'
import { useCart } from './cartStore'

export const useAuth = create((set) => ({
  user: null,
  loading: false,

  setToken: (token) => {
    localStorage.setItem('token', token)
  },

  setUser: (user) => set({ user }),

  fetchMe: async () => {
    if (!localStorage.getItem('token')) {
      set({ user: null, loading: false })
      return null
    }
    set({ loading: true })
    try {
      const data = await me()
      set({ user: data, loading: false })
      return data
    } catch (error) {
      console.error('fetchMe failed', error)
      localStorage.removeItem('token')
      set({ user: null, loading: false })
      return null
    }
  },

 
  logout: () => {
    // ลบ token / user / cart แค่ฝั่ง client
    localStorage.removeItem('token')
    set({ user: null, loading: false })

    try {
      useCart.getState().reset()
    } catch (err) {
     
    }

  },
}))
