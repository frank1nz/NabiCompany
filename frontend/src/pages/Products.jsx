import { useEffect, useState } from 'react'
import {Paper,Typography,Card,CardContent,CardMedia,Chip,Stack,Box,
} from '@mui/material'
import { fetchPublicProducts } from '../lib/products'

const uploadBase = import.meta.env.VITE_UPLOAD_BASE

const imgSrc = (path) => (path?.startsWith('http') ? path : `${uploadBase}/${path}`)

export default function Products({ compact = false }) {
  const [items, setItems] = useState([])

  
  useEffect(() => {
    fetchPublicProducts()
      .then((data) => setItems(data || []))
      .catch((err) => console.error('fetch products failed', err))
  }, []) 

  // mock data
  // const mockProducts = [
  //   {
  //     _id: 1,
  //     name: 'The Spirit of ChaiyaPhum',
  //     description: 'Crafted from local herbs and pure grain alcohol.',
  //     price: 1890,
  //     images: [
  //       'https://res.theconcert.com/c_thumb/4597bedb2fa94121193375776d7e4a10f/1.jpg',
  //     ],
  //     tags: ['local', 'premium'],
  //   },
  //   {
  //     _id: 2,
  //     name: 'ONSON',
  //     description: 'Thai handcrafted spirit from Sakon Nakhon.',
  //     price: 1490,
  //     images: [
  //       'https://res.theconcert.com/c_thumb/98ce38ce484b6916216a3d7565d8fa52e/2.jpg',
  //     ],
  //     tags: ['handmade'],
  //   },
  //   {
  //     _id: 3,
  //     name: 'Kilo Spirits',
  //     description: 'A modern gin distilled in Krabi.',
  //     price: 2990,
  //     images: [
  //       'https://res.theconcert.com/c_thumb/5e7d5ea2c4f22bff0bc91909a23ffaca3/3.jpg',
  //     ],
  //     tags: ['gin', 'modern'],
  //   },
  //   {
  //     _id: 4,
  //     name: 'Nabi Honey Blend',
  //     description: 'Infused with Doi Tung honey, smooth and mellow.',
  //     price: 1690,
  //     images: [
  //       'https://res.theconcert.com/c_thumb/036f6dfbbbdb2df9f264056e67e82ae5f/4.jpg',
  //     ],
  //     tags: ['honey', 'sweet'],
  //   },
  //   {
  //     _id: 5,
  //     name: 'Nabi Coffee Cask',
  //     description: 'Finished in coffee casks for roasted aroma.',
  //     price: 2890,
  //     images: [
  //       'https://res.theconcert.com/c_thumb/af64c82fc589bbafedc334fff08eaa348/5.jpg',
  //     ],
  //     tags: ['coffee', 'limited'],
  //   },
  //   {
  //     _id: 6,
  //     name: 'Doi Tung Lychee Spirit',
  //     description:
  //       'กลั่นจากลิ้นจี่ดอยตุง หอมหวาน สดชื่นและเป็นเอกลักษณ์',
  //     price: 1790,
  //     images: [
  //       'https://res.theconcert.com/c_thumb/4bcacdb926ddfa1f1112caee9857fa0f5/6.jpg',
  //     ],
  //     tags: ['fruit', 'limited'],
  //   },
  // ]

  // useEffect(() => {
  //   setItems(mockProducts)
  // }, [])

  const list = compact ? items.slice(0, 6) : items

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto', width: '100%' }}>
      {!compact && (
        <Typography variant="h6" mb={3} fontWeight="bold" align="center">
          🥃 สินค้า
        </Typography>
      )}

      {/*  ใช้ Box Grid แทน MUI Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // มือถือ
            sm: 'repeat(2, 1fr)', // แท็บเล็ต
            md: 'repeat(3, 1fr)', // คอมพ์
          },
          gap: 3,
          justifyItems: 'center',
        }}
      >
        {list.map((product) => {
          const cover = product.images?.[0]
          return (
            <Card
              key={product._id}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 4,
                width: '100%',
                maxWidth: 340,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.03)' },
              }}
            >
              {cover && (
                <CardMedia
                  component="img"
                  image={imgSrc(cover)}
                  alt={product.name}
                  sx={{
                    height: 250,
                    width: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {product.name}
                </Typography>
                {product.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {product.description}
                  </Typography>
                )}
                {product.price != null && (
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 1,
                      fontWeight: 'bold',
                      color: '#00796b',
                    }}
                  >
                    ฿ {Number(product.price).toLocaleString()}
                  </Typography>
                )}
                {product.tags?.length ? (
                  <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                    {product.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                ) : null}
              </CardContent>
            </Card>
          )
        })}

        {/* ถ้าไม่มีสินค้า */}
        {!list.length && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="text.secondary">
              ไม่มีสินค้าให้แสดง
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
