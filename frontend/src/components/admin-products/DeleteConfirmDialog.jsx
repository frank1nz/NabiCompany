import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'

export default function DeleteConfirmDialog({ open, product, onClose, onConfirm }) {
  const isRestore = Boolean(product?.deletedAt)
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isRestore ? 'ยืนยันการกู้คืนสินค้า' : 'ยืนยันการลบ (Soft Delete)'}</DialogTitle>
      <DialogContent dividers>
        {isRestore
          ? `ต้องการกู้คืนสินค้า "${product?.name}" ใช่ไหม`
          : `ต้องการลบ (Soft Delete) สินค้า "${product?.name}" ใช่ไหม`}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" color={isRestore ? 'success' : 'error'} onClick={onConfirm}>
          {isRestore ? 'Restore' : 'Soft Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
