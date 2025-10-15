// src/components/ImagePicker.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Stack, Button, InputLabel, IconButton, Typography, Box, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function ImagePicker({
  label = 'Images',
  files = [],
  onChange,
  accept = 'image/jpeg,image/png,image/webp',
  maxFileMB = 8,
  maxCount = 12,
  helperText,
  sx,
}) {
  const [error, setError] = useState('');
  const dropRef = useRef(null);

  // previews สร้างจาก files เสมอ (sync กับพาเรนต์)
  const previews = useMemo(() => {
    return files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
  }, [files]);

  // ล้าง ObjectURL เมื่อ unmount หรือ files เปลี่ยน
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const mimeList = accept.split(',').map((s) => s.trim()).filter(Boolean);

  const validateFile = (file) => {
    if (!mimeList.includes(file.type)) {
      return `รองรับเฉพาะไฟล์: ${mimeList.join(', ')}`;
    }
    if (file.size > maxFileMB * 1024 * 1024) {
      return `ไฟล์ ${file.name} มีขนาดเกิน ${maxFileMB}MB`;
    }
    return '';
  };

  const pickAndAdd = (list) => {
    const cur = files.slice();
    let err = '';
    const names = new Set(cur.map((f) => f.name + '_' + f.size)); // กันซ้ำแบบหยาบ

    for (const file of list) {
      if (cur.length >= maxCount) { err = `เลือกรูปได้ไม่เกิน ${maxCount} รูป`; break; }
      const v = validateFile(file);
      if (v) { err = v; break; }
      const key = file.name + '_' + file.size;
      if (names.has(key)) { err = `ไฟล์ ${file.name} ถูกเลือกซ้ำ`; break; }
      names.add(key);
      cur.push(file);
    }

    setError(err);
    onChange?.(cur);
  };

  const onInputChange = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    pickAndAdd(list);
    e.target.value = null; // reset input
  };

  // Drag & Drop
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
    const onDrop = (ev) => {
      prevent(ev);
      const list = Array.from(ev.dataTransfer?.files || []);
      if (!list.length) return;
      pickAndAdd(list);
    };
    el.addEventListener('dragenter', prevent);
    el.addEventListener('dragover', prevent);
    el.addEventListener('dragleave', prevent);
    el.addEventListener('drop', onDrop);
    return () => {
      el.removeEventListener('dragenter', prevent);
      el.removeEventListener('dragover', prevent);
      el.removeEventListener('dragleave', prevent);
      el.removeEventListener('drop', onDrop);
    };
  }, [files]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeAt = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    onChange?.(next);
  };

  const clearAll = () => {
    onChange?.([]);
  };

  return (
    <Box sx={sx}>
      <InputLabel>{label}</InputLabel>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
        <Button variant="outlined" component="label">
          เลือกไฟล์
          <input type="file" hidden multiple accept={accept} onChange={onInputChange} />
        </Button>
        <Typography variant="caption" color="text.secondary">
          รองรับ: {mimeList.join(', ')} • สูงสุด {maxFileMB}MB/ไฟล์ • ไม่เกิน {maxCount} รูป
        </Typography>
        {!!files.length && (
          <Tooltip title="ลบภาพทั้งหมด">
            <Button color="error" onClick={clearAll} size="small" sx={{ ml: 'auto' }}>
              ลบทั้งหมด
            </Button>
          </Tooltip>
        )}
      </Stack>

      {/* พื้นที่ Drag & Drop */}
      <Box
        ref={dropRef}
        sx={{
          mt: 2,
          p: 2,
          border: '1px dashed rgba(0,0,0,0.25)',
          borderRadius: 2,
          textAlign: 'center',
          color: 'text.secondary',
          transition: 'all .15s',
          '&:hover': { borderColor: 'rgba(0,0,0,0.35)', bgcolor: 'rgba(0,0,0,0.02)' },
        }}
      >
        ลากและวางรูปภาพมาที่นี่
      </Box>

      {!!previews.length && (
        <Stack direction="row" flexWrap="wrap" gap={1.5} mt={2}>
          {previews.map((p, idx) => (
            <Box
              key={p.url}
              sx={{
                position: 'relative',
                width: 96,
                height: 96,
                borderRadius: 1.5,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.12)',
                bgcolor: '#fafafa',
              }}
            >
              <img
                src={p.url}
                alt={`preview-${idx}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onLoad={() => URL.revokeObjectURL(p.url)} // free asap after draw
              />
              <IconButton
                size="small"
                onClick={() => removeAt(idx)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(255,255,255,0.85)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                }}
                aria-label={`ลบภาพที่ ${idx + 1}`}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      {helperText && (
        <Typography variant="caption" color="text.secondary" mt={1} display="block">
          {helperText}
        </Typography>
      )}
      {!!error && (
        <Typography color="error.main" mt={1}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
