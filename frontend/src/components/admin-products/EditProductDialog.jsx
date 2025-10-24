// src/components/EditProductDialog.jsx

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, TextField, Button, Box, Typography,
  MenuItem, Chip, InputAdornment, IconButton, Tooltip, Divider
} from '@mui/material'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import ImagePicker from './ImagesPicker' // <- ใช้คอมโพเนนต์เดิมของคุณ

const blank = {
  name: '',
  description: '',
  price: '',
  stock: 0,
  visibility: 'public',
  status: 'active',
  tags: '',
}

const VISIBILITY = ['public', 'hidden']
const STATUS = ['active', 'inactive']

export default function EditProductDialog({
  open,
  product,
  onClose,
  onSubmit,
  saving = false,                  // <- ส่ง true ระหว่างบันทึกเพื่อ disable ปุ่ม/ฟอร์ม
  uploadBase = '',                 // <- base url สำหรับรูปเดิม เช่น `${import.meta.env.VITE_UPLOAD_BASE}`
}) {
  const [form, setForm] = useState(blank)
  const [files, setFiles] = useState([])              // รูปใหม่ที่เพิ่ม
  const [removeIds, setRemoveIds] = useState([])      // id/ชื่อไฟล์ของรูปเดิมที่ติ๊กลบ
  const [dirty, setDirty] = useState(false)

  // ติดตั้งค่าเริ่มจาก product
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        stock: product.stock ?? 0,
        visibility: product.visibility || 'public',
        status: product.status || 'active',
        tags: (product.tags || []).join(', '),
      })
      setFiles([])
      setRemoveIds([])
      setDirty(false)
    } else {
      setForm(blank)
      setFiles([])
      setRemoveIds([])
      setDirty(false)
    }
  }, [product, open])

  const setField = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setDirty(true)
  }

  // ----- Validation / Derived -----
  const priceNumber = useMemo(() => {
    const n = Number(form.price)
    return Number.isFinite(n) ? Math.max(0, n) : ''
  }, [form.price])

  const stockNumber = useMemo(() => {
    const n = Number(form.stock)
    if (!Number.isFinite(n)) return ''
    return Math.floor(n)
  }, [form.stock])

  const tagsArray = useMemo(() =>
    form.tags
      .split(',')
      .map(s => s.trim())
      .filter(Boolean), [form.tags]
  )

  const nameOk = form.name.trim().length >= 2
  const priceOk = priceNumber !== '' && priceNumber >= 0
  const stockOk = stockNumber !== '' && stockNumber >= 0
  const visibilityOk = VISIBILITY.includes(String(form.visibility))
  const statusOk = STATUS.includes(String(form.status))
  const canSubmit = nameOk && priceOk && stockOk && visibilityOk && statusOk && !saving

  // ลบรูปเดิมทีละใบ
  const toggleRemove = (imgId) => {
    setDirty(true)
    setRemoveIds(prev => prev.includes(imgId) ? prev.filter(i => i !== imgId) : [...prev, imgId])
  }

  const submit = async () => {
    if (!canSubmit) return
    const payload = {
      form: {
        ...form,
        price: priceNumber,
        stock: stockNumber,
        tags: form.tags,
        visibility: form.visibility,
        status: form.status,
      },
      files,       // รูปใหม่ (File[])
      removeIds,   // ไฟล์เดิมที่ให้ลบ (id/ชื่อไฟล์ตามที่ backend รองรับ)
    }
    await onSubmit?.(payload)
  }

  const handleClose = () => {
    if (saving) return
    onClose?.()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>
        แก้ไขสินค้า {product?.name ? `— ${product.name}` : ''}
      </DialogTitle>

      <DialogContent dividers>
        {/* รูปเดิมของสินค้า (ถ้ามี) */}
        {!!(product?.images?.length) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>รูปปัจจุบัน</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 1 }}>
              {product.images.map((img, idx) => {
                // รองรับได้ทั้ง path string หรือ object { _id, path }
                const id = img?._id || img?.id || img?.path || img
                const src = (img?.url) || (uploadBase && img?.path ? `${uploadBase}/${img.path}` : (typeof img === 'string' ? `${uploadBase}/${img}` : ''))
                const marked = removeIds.includes(id)
                return (
                  <Box key={id || idx} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', border: '1px solid rgba(0,0,0,.08)' }}>
                    <img
                      src={src}
                      alt={`img-${idx}`}
                      style={{ width: '100%', height: 96, objectFit: 'cover', filter: marked ? 'grayscale(1) blur(1px)' : 'none', opacity: marked ? .6 : 1 }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <Button
                      size="small"
                      variant={marked ? 'contained' : 'outlined'}
                      color={marked ? 'error' : 'inherit'}
                      onClick={() => toggleRemove(id)}
                      sx={{
                        position: 'absolute',
                        left: 6,
                        bottom: 6,
                        px: 1.2,
                        py: 0.2,
                        fontSize: 12,
                        backdropFilter: 'blur(3px)',
                      }}
                    >
                      {marked ? 'ยกเลิกลบ' : 'ลบรูป'}
                    </Button>
                  </Box>
                )
              })}
            </Box>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        <Stack spacing={2}>
          <TextField
            label="ชื่อสินค้า"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            required
            error={!!form.name && !nameOk}
            helperText={!!form.name && !nameOk ? 'อย่างน้อย 2 ตัวอักษร' : ' '}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="ราคา (บาท)"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              required
              error={!!form.price && !priceOk}
              helperText={!!form.price && !priceOk ? 'กรุณากรอกราคาให้ถูกต้อง' : ' '}
              sx={{ minWidth: 180 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">฿</InputAdornment>,
              }}
            />

            <TextField
              label="จำนวนคงเหลือ (ชิ้น)"
              type="number"
              inputProps={{ min: 0, step: 1 }}
              value={form.stock}
              onChange={(e) => setField('stock', e.target.value)}
              required
              error={!!String(form.stock) && !stockOk}
              helperText={!!String(form.stock) && !stockOk ? 'กรุณากรอกจำนวนให้ถูกต้อง' : ' '}
              sx={{ minWidth: 160 }}
            />
  
            <TextField
              select
              label="Visibility"
              value={form.visibility}
              onChange={(e) => setField('visibility', e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {VISIBILITY.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>

            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => setField('status', e.target.value)}
              sx={{ minWidth: 160 }}
            >
              {STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Stack>

          <TextField
            label="รายละเอียด"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            multiline
            minRows={3}
          />

          {/* แท็กเป็นชิป: พิมพ์คั่นด้วย comma แล้วขึ้นชิปให้เห็น */}
          <Box>
            <TextField
              label="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)"
              value={form.tags}
              onChange={(e) => setField('tags', e.target.value)}
              fullWidth
            />
            <Box sx={{ mt: 1, display: 'flex', gap: .5, flexWrap: 'wrap' }}>
              {tagsArray.map(t => <Chip key={t} label={t} size="small" />)}
              {!tagsArray.length && (
                <Typography variant="caption" color="text.secondary">เช่น: craft, honey, premium</Typography>
              )}
            </Box>
          </Box>

          {/* อัปโหลดรูปใหม่ (ไม่บังคับ) */}
          <ImagePicker
            label="เพิ่มรูปใหม่ (ไม่บังคับ)"
            files={files}
            onChange={(fs) => { setFiles(fs); setDirty(true) }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Tooltip title={dirty ? '' : 'ยังไม่มีการแก้ไข'}>
          <span>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={saving}
              startIcon={<ClearRoundedIcon />}
            >
              ยกเลิก
            </Button>
          </span>
        </Tooltip>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!canSubmit}
        >
          {saving ? 'กำลังบันทึก…' : 'บันทึก'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

