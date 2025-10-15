import { useState } from 'react'
import { Stack, TextField, Button, Typography } from '@mui/material'
import ImagePicker from './ImagesPicker'

export default function ProductForm({ initialForm, onSubmit, success, error, onClearMessages }) {
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])

  const handleChange = (field) => (e) => {
    onClearMessages?.()
    setForm((p) => ({ ...p, [field]: e.target.value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const ok = await onSubmit?.({ form, files })
    if (ok) {
      setForm(initialForm)
      setFiles([])
    }
  }

  return (
    <Stack component="form" spacing={2} onSubmit={submit}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
        <TextField label="ชื่อสินค้า" value={form.name} onChange={handleChange('name')} fullWidth />
        <TextField label="ราคา (บาท)" type="number" value={form.price} onChange={handleChange('price')} sx={{ minWidth: 180 }} />
      </Stack>

      <TextField label="รายละเอียด" value={form.description} onChange={handleChange('description')} multiline rows={3} />
      <TextField label="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)" value={form.tags} onChange={handleChange('tags')} />

      <ImagePicker label="Images" files={files} onChange={setFiles} />

      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
        <TextField label="Visibility" value={form.visibility} onChange={handleChange('visibility')} placeholder="public / hidden" sx={{ minWidth: 160 }} />
        <TextField label="Status" value={form.status} onChange={handleChange('status')} placeholder="active / inactive" sx={{ minWidth: 160 }} />
      </Stack>

      {!!success && <Typography color="success.main">{success}</Typography>}
      {!!error && <Typography color="error.main">{error}</Typography>}

      <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
        เพิ่มสินค้า
      </Button>
    </Stack>
  )
}
