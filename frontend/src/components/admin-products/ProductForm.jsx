import { useState } from 'react';
import {
  Stack, TextField, Button, Typography, Box, MenuItem, Alert, InputAdornment
} from '@mui/material';
import ImagePicker from './ImagesPicker';

const VISIBILITY = ['public', 'hidden'];
const STATUS = ['active', 'inactive'];

export default function ProductForm({
  initialForm,
  onSubmit,
  success,
  error,
  onClearMessages,
}) {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const setField = (k, v) => {
    onClearMessages?.();
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const handleChange = (field) => (e) => setField(field, e.target.value);

  const canSubmit =
    form.name.trim().length > 1 &&
    Number(form.price) > 0 &&
    !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    const ok = await onSubmit?.({ form, files });
    if (ok) {
      setForm(initialForm);
      setFiles([]);
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={2}>
        {/* Product Info */}
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            label="ชื่อสินค้า"
            value={form.name}
            onChange={handleChange('name')}
            required
            fullWidth
          />
          <TextField
            label="ราคา (บาท)"
            type="number"
            value={form.price}
            onChange={handleChange('price')}
            required
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">฿</InputAdornment>
              ),
              inputProps: { min: 0, step: '0.01' },
            }}
          />
        </Stack>

        <TextField
          label="รายละเอียด"
          value={form.description}
          onChange={handleChange('description')}
          multiline
          rows={3}
        />

        <TextField
          label="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)"
          value={form.tags}
          onChange={handleChange('tags')}
          placeholder="เช่น craft, honey, premium"
        />

        {/* Images */}
        <ImagePicker
          label="รูปภาพสินค้า"
          files={files}
          onChange={setFiles}
          helperText="สามารถอัปโหลดได้หลายรูป (สูงสุด 8MB ต่อรูป)"
        />

        {/* Visibility & Status */}
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            select
            label="Visibility"
            value={form.visibility}
            onChange={handleChange('visibility')}
            sx={{ minWidth: 160 }}
          >
            {VISIBILITY.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={form.status}
            onChange={handleChange('status')}
            sx={{ minWidth: 160 }}
          >
            {STATUS.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Messages */}
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit || loading}
          sx={{
            alignSelf: 'flex-start',
            bgcolor: '#D4AF37',
            color: '#111',
            fontWeight: 800,
            '&:hover': { bgcolor: '#C6A132' },
          }}
        >
          {loading ? 'กำลังเพิ่มสินค้า…' : 'เพิ่มสินค้า'}
        </Button>
      </Stack>
    </Box>
  );
}
