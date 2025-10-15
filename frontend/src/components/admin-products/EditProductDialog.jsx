import { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Button } from '@mui/material'
import ImagePicker from './ImagesPicker'

const blank = {
  name: '',
  description: '',
  price: '',
  visibility: 'public',
  status: 'active',
  tags: '',
}

export default function EditProductDialog({ open, product, onClose, onSubmit }) {
  const [form, setForm] = useState(blank)
  const [files, setFiles] = useState([]) // รูปใหม่ที่จะอัปโหลดเพิ่ม

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        visibility: product.visibility || 'public',
        status: product.status || 'active',
        tags: (product.tags || []).join(', '),
      })
      setFiles([])
    } else {
      setForm(blank)
      setFiles([])
    }
  }, [product, open])

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const submit = async () => {
    await onSubmit?.({ form, files })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>แก้ไขสินค้า</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField label="ชื่อสินค้า" value={form.name} onChange={handleChange('name')} />
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <TextField label="ราคา (บาท)" type="number" value={form.price} onChange={handleChange('price')} sx={{ minWidth: 180 }} />
            <TextField label="Visibility" value={form.visibility} onChange={handleChange('visibility')} placeholder="public / hidden" sx={{ minWidth: 160 }} />
            <TextField label="Status" value={form.status} onChange={handleChange('status')} placeholder="active / inactive" sx={{ minWidth: 160 }} />
          </Stack>
          <TextField label="รายละเอียด" value={form.description} onChange={handleChange('description')} multiline rows={3} />
          <TextField label="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)" value={form.tags} onChange={handleChange('tags')} />

          {/* อัปโหลดรูปใหม่ (ไม่บังคับ) */}
          <ImagePicker label="เพิ่มรูปใหม่ (ไม่บังคับ)" files={files} onChange={setFiles} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" onClick={submit}>บันทึก</Button>
      </DialogActions>
    </Dialog>
  )
}
