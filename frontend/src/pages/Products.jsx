import { useEffect, useState } from 'react'
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
} from '@mui/material'
import { fetchPublicProducts } from '../lib/products'

const uploadBase = import.meta.env.VITE_UPLOAD_BASE

export default function Products({ compact = false }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchPublicProducts()
      .then((data) => setItems(data || []))
      .catch((err) => console.error('fetch products failed', err))
  }, [])

  const list = compact ? items.slice(0, 6) : items

  return (
    <Paper sx={{ p: 3 }}>
      {!compact && <Typography variant="h6" mb={2}>สินค้า</Typography>}
      <Grid container spacing={2}>
        {list.map((product) => {
          const cover = product.images?.[0]
          return (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card>
                {cover && (
                  <CardMedia
                    component="img"
                    height="180"
                    image={`${uploadBase}/${cover}`}
                    alt={product.name}
                  />
                )}
                <CardContent>
                  <Typography variant="subtitle1">{product.name}</Typography>
                  {product.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
                      {product.description}
                    </Typography>
                  )}
                  {product.price != null && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      ฿ {Number(product.price).toLocaleString()}
                    </Typography>
                  )}
                  {product.tags?.length ? (
                    <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                      {product.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  ) : null}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
        {!list.length && (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary">
              ไม่มีสินค้าให้แสดง
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  )
}
