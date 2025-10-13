import { Typography, Box, Divider } from '@mui/material'
import Products from './Products'


export default function Home() {
return (
<Box>
<Typography variant="h4" gutterBottom>Welcome to Nabi</Typography>
<Typography variant="body1" gutterBottom>
This is a demo site showing public products and gated features like user verification (KYC) and leads.
</Typography>
<Divider sx={{ my: 3 }} />
<Typography variant="h6" gutterBottom>Featured Products</Typography>
<Products compact />
</Box>
)
}