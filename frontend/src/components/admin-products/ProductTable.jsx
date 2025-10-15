import {
  Table, TableHead, TableRow, TableCell, TableBody, Stack,
  Chip, Button, Tooltip, Box, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

const BRAND = {
  navy: '#1C2738',
  gold: '#D4AF37',
};

export default function ProductTable({ products = [], onToggleStatus, onEdit, onAskDelete }) {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 800 }}>
        <TableHead sx={{ bgcolor: 'rgba(28,39,56,0.04)' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>ชื่อ</TableCell>
            <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>ราคา</TableCell>
            <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>สถานะ</TableCell>
            <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>Visibility</TableCell>
            <TableCell sx={{ fontWeight: 700, color: BRAND.navy }}>Tags</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: BRAND.navy }}>จัดการ</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.map((product) => {
            const isActive = product.status === 'active';
            const isDeleted = Boolean(product.deletedAt);

            return (
              <TableRow
                key={product._id}
                hover
                sx={{
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                  transition: 'background 0.15s',
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  ฿ {Number(product.price || 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      color: isActive ? '#fff' : '#555',
                      bgcolor: isActive ? BRAND.navy : 'rgba(0,0,0,0.08)',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.visibility}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      borderColor:
                        product.visibility === 'public' ? BRAND.gold : 'rgba(0,0,0,0.2)',
                      color:
                        product.visibility === 'public' ? BRAND.gold : 'text.secondary',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {(product.tags || []).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: 'rgba(0,0,0,0.15)',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Stack>
                </TableCell>

                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-end"
                    sx={{ flexWrap: 'wrap' }}
                  >
                    <Tooltip title={isActive ? 'Deactivate' : 'Activate'}>
                      <Button
                        size="small"
                        startIcon={isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        variant="outlined"
                        color={isActive ? 'inherit' : 'success'}
                        onClick={() => onToggleStatus(product)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 20,
                          fontWeight: 700,
                        }}
                      >
                        {isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </Button>
                    </Tooltip>

                    <Tooltip title="Edit Product">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        variant="outlined"
                        onClick={() => onEdit(product)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 20,
                          fontWeight: 700,
                        }}
                      >
                        แก้ไข
                      </Button>
                    </Tooltip>

                    <Tooltip title={isDeleted ? 'Restore Product' : 'Soft Delete'}>
                      <Button
                        size="small"
                        startIcon={isDeleted ? <RestoreIcon /> : <DeleteIcon />}
                        variant="contained"
                        color={isDeleted ? 'success' : 'error'}
                        onClick={() => onAskDelete(product)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 20,
                          fontWeight: 800,
                          bgcolor: isDeleted ? '#388E3C' : '#D32F2F',
                          '&:hover': {
                            bgcolor: isDeleted ? '#2E7D32' : '#C62828',
                          },
                        }}
                      >
                        {isDeleted ? 'กู้คืน' : 'ลบ'}
                      </Button>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}

          {!products.length && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">ยังไม่มีสินค้า</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
