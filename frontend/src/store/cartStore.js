import { create } from 'zustand'
import {
  fetchCart,
  addCartItem as addCartItemRequest,
  updateCartItem as updateCartItemRequest,
  removeCartItem as removeCartItemRequest,
  clearCart as clearCartRequest,
} from '../lib/orders'

const emptyTotals = { amount: 0, quantity: 0 }

export const useCart = create((set, get) => ({
  items: [],
  totals: emptyTotals,
  lastUpdated: null,
  loading: false,
  error: '',

  setCart: ({ items = [], totals = emptyTotals, updatedAt = null }) =>
    set({
      items,
      totals: {
        amount: Number(totals.amount || 0),
        quantity: Number(totals.quantity || 0),
      },
      lastUpdated: updatedAt || new Date().toISOString(),
      error: '',
    }),

  reset: () =>
    set({
      items: [],
      totals: emptyTotals,
      lastUpdated: null,
      error: '',
    }),

  loadCart: async () => {
    set({ loading: true, error: '' })
    try {
      const data = await fetchCart()
      get().setCart(data)
      set({ loading: false })
      return data
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'ไม่สามารถโหลดตะกร้าได้'
      set({ loading: false, error: message })
      throw error
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ loading: true, error: '' })
    try {
      const data = await addCartItemRequest({ productId, quantity })
      get().setCart(data)
      set({ loading: false })
      return data
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'ไม่สามารถเพิ่มสินค้าได้'
      set({ loading: false, error: message })
      throw error
    }
  },

  updateItem: async (productId, quantity) => {
    set({ loading: true, error: '' })
    try {
      const data = await updateCartItemRequest(productId, { quantity })
      get().setCart(data)
      set({ loading: false })
      return data
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'ไม่สามารถอัปเดตรายการได้'
      set({ loading: false, error: message })
      throw error
    }
  },

  removeItem: async (productId) => {
    set({ loading: true, error: '' })
    try {
      const data = await removeCartItemRequest(productId)
      get().setCart(data)
      set({ loading: false })
      return data
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'ไม่สามารถนำสินค้าออกได้'
      set({ loading: false, error: message })
      throw error
    }
  },

  clear: async () => {
    set({ loading: true, error: '' })
    try {
      const data = await clearCartRequest()
      get().setCart(data)
      set({ loading: false })
      return data
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'ไม่สามารถล้างตะกร้าได้'
      set({ loading: false, error: message })
      throw error
    }
  },
}))
