import { Container } from '@mui/material'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../store/authStore'


export default function Layout() {
const { fetchMe } = useAuth()
useEffect(() => {
if (localStorage.getItem('token')) fetchMe()
}, [])
return (
<>
<Navbar />
<Container sx={{ py: 3 }}>
<Outlet />
</Container>
</>
)
}