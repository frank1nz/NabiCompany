import { useState } from 'react';
import {
  Stack, TextField, Button, Typography, Box, MenuItem, Alert, InputAdornment, Paper
} from '@mui/material';
import ImagePicker from './ImagesPicker';

const VISIBILITY = ['public', 'hidden'];
const STATUS = ['active', 'inactive'];

// 💙 Blue Minimal Theme
const BRAND = {
  navy: '#0B2B54',
  blue: '#1D4ED8',
  sky: '#0EA5E9',
  soft: '#E6F3FF',
  border: 'rgba(2,132,199,.18)',
  ink: '#0F172A',
};

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
    Number(form.stock) >= 0 &&
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
    <Paper
      elevation={0}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        borderRadius: 3,
        border: `1px solid ${BRAND.border}`,
        boxShadow: '0 3px 14px rgba(2,132,199,.06)',
        background: '#fff',
        width: '100%',
      }}
    >
      <Stack spacing={2.5}>
        {/* Product Info */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={2}
          sx={{ '& .MuiTextField-root': { flex: 1 } }}
        >
          <TextField
            label="ชื่อสินค้า"
            value={form.name}
            onChange={handleChange('name')}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: BRAND.border },
                '&:hover fieldset': { borderColor: BRAND.sky },
                '&.Mui-focused fieldset': {
                  borderColor: BRAND.blue,
                  boxShadow: '0 0 0 2px rgba(29,78,216,.08)',
                },
              },
            }}
          />

          <TextField
            label="ราคา (บาท)"
            type="number"
            value={form.price}
            onChange={handleChange('price')}
            required
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: BRAND.border },
                '&:hover fieldset': { borderColor: BRAND.sky },
                '&.Mui-focused fieldset': {
                  borderColor: BRAND.blue,
                  boxShadow: '0 0 0 2px rgba(29,78,216,.08)',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">฿</InputAdornment>
              ),
              inputProps: { min: 0, step: 1 },
            }}
          />

          <TextField
            label="จำนวนคงเหลือ (ชิ้น)"
            type="number"
            value={form.stock}
            onChange={handleChange('stock')}
            required
            sx={{
              minWidth: 180,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: BRAND.border },
                '&:hover fieldset': { borderColor: BRAND.sky },
                '&.Mui-focused fieldset': {
                  borderColor: BRAND.blue,
                  boxShadow: '0 0 0 2px rgba(29,78,216,.08)',
                },
              },
            }}
            inputProps={{ min: 0, step: 1 }}
          />
        </Stack>

        <TextField
          label="รายละเอียด"
          value={form.description}
          onChange={handleChange('description')}
          multiline
          rows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': { borderColor: BRAND.border },
              '&:hover fieldset': { borderColor: BRAND.sky },
              '&.Mui-focused fieldset': {
                borderColor: BRAND.blue,
                boxShadow: '0 0 0 2px rgba(29,78,216,.08)',
              },
            },
          }}
        />

        <TextField
          label="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)"
          value={form.tags}
          onChange={handleChange('tags')}
          placeholder="เช่น craft, honey, premium"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': { borderColor: BRAND.border },
              '&:hover fieldset': { borderColor: BRAND.sky },
              '&.Mui-focused fieldset': {
                borderColor: BRAND.blue,
                boxShadow: '0 0 0 2px rgba(29,78,216,.08)',
              },
            },
          }}
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
            sx={{
              minWidth: 160,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: BRAND.border },
                '&:hover fieldset': { borderColor: BRAND.sky },
                '&.Mui-focused fieldset': {
                  borderColor: BRAND.blue,
                  boxShadow: '0 0 0 2px rgba(29,78,216,.08)',
                },
              },
            }}
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
            sx={{
              minWidth: 160,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderColor: BRAND.border },
                '&:hover fieldset': { borderColor: BRAND.sky },
                '&.Mui-focused fieldset': {
                  borderColor: BRAND.blue,
                  boxShadow: '0 0 0 2px rgba(29,78,216,.08)',
                },
              },
            }}
          >
            {STATUS.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Messages */}
        {success && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit || loading}
          sx={{
            alignSelf: 'flex-start',
            bgcolor: BRAND.blue,
            color: '#fff',
            fontWeight: 800,
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            boxShadow: '0 3px 10px rgba(2,132,199,.25)',
            '&:hover': { bgcolor: BRAND.sky },
          }}
        >
          {loading ? 'กำลังเพิ่มสินค้า…' : 'เพิ่มสินค้า'}
        </Button>
      </Stack>
    </Paper>
  );
}
