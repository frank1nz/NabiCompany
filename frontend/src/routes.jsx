import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import RequireVerified from './components/RequireVerified'

// pages (profile)
import Profile from './pages/Profile'


// pages (public)
import Home from './pages/Home'
import Products from './pages/Products'
import Login from './pages/Login'
import Register from './pages/Register'


// pages (user)
import Status from './pages/Status'
import LeadForm from './pages/LeadForm'


// pages (admin)
import AdminKyc from './pages/admin/AdminKyc'
import AdminLeads from './pages/admin/AdminLeads'
import AdminProducts from './pages/admin/AdminProduct'


export const router = createBrowserRouter([
{
path: '/',
element: <Layout />,
children: [
// Public
{ index: true, element: <Home /> }, // "/"
{ path: 'product', element: <Products /> }, // "/product"
{ path: 'login', element: <Login /> },
{ path: 'register', element: <Register /> },


// User (must login)
{ path: 'status', element: (
<RequireAuth roles={["user","admin"]}>
<Status />
</RequireAuth>
) },
{ path: 'lead', element: (
<RequireAuth roles={["user","admin"]}>
<RequireVerified>
<LeadForm />
</RequireVerified>
</RequireAuth>
) },


// Admin only
{ path: 'admin/kyc', element: (
<RequireAuth roles={["admin"]}>
<AdminKyc />
</RequireAuth>
) },
{ path: 'admin/leads', element: (
<RequireAuth roles={["admin"]}>
<AdminLeads />
</RequireAuth>
) },
{ path: 'admin/products', element: (
<RequireAuth roles={["admin"]}>
<AdminProducts />
</RequireAuth>
) },

// Profile (user or admin can see any profile)
{ path: 'me/:id', element: (
<RequireAuth roles={["user","admin"]}>
<Profile />
</RequireAuth>
)},
],
},
])