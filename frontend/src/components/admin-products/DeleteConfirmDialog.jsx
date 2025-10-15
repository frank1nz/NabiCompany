// src/components/DeleteConfirmDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from '@mui/material';

const BRAND = { gold: '#D4AF37', navy: '#1C2738' };

export default function DeleteConfirmDialog({ open, product, onClose, onConfirm }) {
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
          color: BRAND.navy,
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
            color: BRAND.navy,
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
              bgcolor: BRAND.gold,
              color: '#111',
              '&:hover': { bgcolor: '#C6A132' },
            }),
          }}
        >
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
