import {
  Table, TableHead, TableRow, TableCell, TableBody, Stack,
  Chip, Button, Tooltip, Box, Typography, useTheme,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

export default function ProductTable({ products = [], onToggleStatus, onEdit, onAskDelete }) {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const accent = theme.palette.secondary.main;
  const navy = brand?.navy || theme.palette.primary.dark;
  const successMain = theme.palette.success.main;
  const errorMain = theme.palette.error.main;

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 940 }}>
        <TableHead sx={{ bgcolor: 'rgba(28,39,56,0.04)' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: navy }}>ชื่อ</TableCell>
            <TableCell sx={{ fontWeight: 700, color: navy }}>ราคา</TableCell>
            <TableCell sx={{ fontWeight: 700, color: navy }}>คงเหลือ</TableCell>
            <TableCell sx={{ fontWeight: 700, color: navy }}>สถานะ</TableCell>
            <TableCell sx={{ fontWeight: 700, color: navy }}>Visibility</TableCell>
            <TableCell sx={{ fontWeight: 700, color: navy }}>Tags</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: navy }}>จัดการ</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {products.map((product) => {
            const isActive = product.status === 'active';
            const isDeleted = Boolean(product.deletedAt);
            const stock = Number(product.stock ?? 0);
            const outOfStock = stock <= 0;
            const lowStock = !outOfStock && stock <= 5;

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
                    label={`${Math.max(0, stock)} ชิ้น`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      color: outOfStock
                        ? theme.palette.common.white
                        : lowStock
                        ? accent
                        : successMain,
                      bgcolor: outOfStock
                        ? errorMain
                        : lowStock
                        ? alpha(accent, 0.2)
                        : alpha(successMain, 0.12),
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      color: isActive ? theme.palette.common.white : theme.palette.text.secondary,
                      bgcolor: isActive ? navy : 'rgba(0,0,0,0.08)',
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
                        product.visibility === 'public' ? accent : 'rgba(0,0,0,0.2)',
                      color:
                        product.visibility === 'public' ? accent : 'text.secondary',
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
                          bgcolor: isDeleted ? successMain : errorMain,
                          '&:hover': {
                            bgcolor: isDeleted
                              ? darken(successMain, 0.12)
                              : darken(errorMain, 0.12),
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
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">ยังไม่มีสินค้า</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
