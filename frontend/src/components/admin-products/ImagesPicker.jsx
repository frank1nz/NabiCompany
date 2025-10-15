import { useState } from 'react'
import { Stack, Button, InputLabel, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const MAX_FILE_MB = 8

export default function ImagePicker({ label = 'Images', files, onChange }) {
  const [previews, setPreviews] = useState([])
  const [error, setError] = useState('')

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || [])
    if (!list.length) return

    const okFiles = []
    const okPreviews = []
    let err = ''

    list.forEach((file) => {
      const isImage = file.type.startsWith('image/')
      const underLimit = file.size <= MAX_FILE_MB * 1024 * 1024
      if (!isImage) {
        err = 'รองรับเฉพาะไฟล์รูปภาพ'
        return
      }
      if (!underLimit) {
        err = `ไฟล์ ${file.name} มีขนาดเกิน ${MAX_FILE_MB}MB`
        return
      }
      okFiles.push(file)
      okPreviews.push(URL.createObjectURL(file))
    })

    if (err) setError(err)
    else setError('')

    onChange?.([...(files || []), ...okFiles])
    setPreviews((p) => [...p, ...okPreviews])
    e.target.value = null
  }

  const removeAt = (idx) => {
    const nextFiles = (files || []).filter((_, i) => i !== idx)
    onChange?.(nextFiles)
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx])
      return prev.filter((_, i) => i !== idx)
    })
  }

  return (
    <div>
      <InputLabel>{label}</InputLabel>
      <Button variant="outlined" component="label" sx={{ mt: 1 }}>
        เลือกไฟล์
        <input type="file" hidden accept="image/*" multiple onChange={handleFiles} />
      </Button>

      {!!previews.length && (
        <Stack direction="row" flexWrap="wrap" gap={1.5} mt={2}>
          {previews.map((src, idx) => (
            <div
              key={src}
              style={{
                position: 'relative',
                width: 96,
                height: 96,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.12)',
              }}
            >
              <img src={src} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <IconButton
                size="small"
                onClick={() => removeAt(idx)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
        </Stack>
      )}
      {!!error && <Typography color="error.main" mt={1}>{error}</Typography>}
    </div>
  )
}
