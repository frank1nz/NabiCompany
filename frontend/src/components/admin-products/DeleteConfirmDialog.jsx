// src/components/DeleteConfirmDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useTheme,
} from '@mui/material';
import { darken } from '@mui/material/styles';

export default function DeleteConfirmDialog({ open, product, onClose, onConfirm }) {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;
  const isRestore = Boolean(product?.deletedAt);
  const title = isRestore ? 'ยืนยันการกู้คืนสินค้า' : 'ยืนยันการลบสินค้า';
  const actionLabel = isRestore ? 'กู้คืน' : 'ลบ';
  const confirmColor = isRestore ? 'success' : 'error';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,.08)',
          boxShadow: '0 8px 28px rgba(0,0,0,.1)',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 900,
          color: brand?.navy || theme.palette.text.primary,
          pb: 1,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        <Typography sx={{ fontSize: 15, lineHeight: 1.6 }}>
          {isRestore ? (
            <>
              ต้องการกู้คืนสินค้า <strong>{product?.name}</strong> ใช่หรือไม่
            </>
          ) : (
            <>
              ต้องการลบสินค้าแบบ <strong>Soft Delete</strong>{' '}
              <strong>{product?.name}</strong> ใช่หรือไม่
            </>
          )}
        </Typography>

        {!isRestore && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            สินค้าจะไม่ถูกลบถาวร และสามารถกู้คืนได้ภายหลังจากหน้า “จัดการสินค้า”
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid rgba(0,0,0,.05)',
          justifyContent: 'space-between',
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'rgba(0,0,0,.2)',
            color: brand?.navy || theme.palette.text.primary,
            fontWeight: 700,
            '&:hover': { bgcolor: 'rgba(0,0,0,.04)' },
          }}
        >
          ยกเลิก
        </Button>

        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          sx={{
            px: 3,
            fontWeight: 900,
            borderRadius: 999,
            ...(isRestore && {
              bgcolor: accent,
              color: theme.palette.secondary.contrastText,
              '&:hover': { bgcolor: darken(accent, 0.08) },
            }),
          }}
        >
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
