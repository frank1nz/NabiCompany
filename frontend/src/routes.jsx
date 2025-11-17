import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import RequireVerified from './components/RequireVerified'
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated'

// Public pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import OurStory from './pages/OurStory'   // 👈 เพิ่ม
import Login from './pages/Login'
import Register from './pages/Register'
import Terms from './pages/Terms'
import Contact from './pages/Contact'

import Orders from './pages/Orders'
import Profile from './pages/Profile'

// Admin pages
import AdminKyc from './pages/admin/AdminKyc'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProduct'
import AdminNews from './pages/admin/AdminNews'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:id', element: <ProductDetail /> },
      { path: 'about', element: <OurStory /> },   
      { path: 'terms', element: <Terms /> },
      { path: 'contact', element: <Contact /> },

      {
        path: 'login',
        element: (
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        ),
      },
      {
        path: 'register',
        element: (
          <RedirectIfAuthenticated>
            <Register />
          </RedirectIfAuthenticated>
        ),
      },

      {
        path: 'orders',
        element: (
          <RequireAuth roles={['user']}>
            <RequireVerified>
              <Orders />
            </RequireVerified>
          </RequireAuth>
        ),
      },
      {
        path: 'me/:id',
        element: (
          <RequireAuth roles={['user', 'admin']}>
            <Profile />
          </RequireAuth>
        ),
      },

      // Admin
      {
        path: 'admin/kyc',
        element: (
          <RequireAuth roles={['admin']}>
            <AdminKyc />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/orders',
        element: (
          <RequireAuth roles={['admin']}>
            <AdminOrders />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <RequireAuth roles={['admin']}>
            <AdminProducts />
          </RequireAuth>
        ),
      },
      {
        path: 'admin/news',
        element: (
          <RequireAuth roles={['admin']}>
            <AdminNews />
          </RequireAuth>
        ),
      },
    ],
  },
])
