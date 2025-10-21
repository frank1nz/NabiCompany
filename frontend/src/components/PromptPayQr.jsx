import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { toDataURL } from 'qrcode';

/**
 * Render PromptPay QR code from payload string.
 */
export default function PromptPayQr({ payload, size = 240, label }) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!payload) {
      setDataUrl('');
      setError('');
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    setError('');
    toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: size,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!alive) return;
        setDataUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        if (!alive) return;
        setError('ไม่สามารถสร้างคิวอาร์โค้ดได้');
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [payload, size]);

  if (!payload) return null;

  return (
    <Box sx={{ textAlign: 'center' }}>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}

      {loading && <CircularProgress size={28} />}
      {!loading && error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
      {!loading && !error && dataUrl && (
        <Box
          component="img"
          src={dataUrl}
          alt="PromptPay QR"
          width={size}
          height={size}
          sx={{
            display: 'inline-block',
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,.08)',
            boxShadow: '0 6px 16px rgba(0,0,0,.08)',
          }}
        />
      )}
    </Box>
  );
}
