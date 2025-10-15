import { Table, TableHead, TableRow, TableCell, TableBody, Stack, Chip, Button } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import RestoreIcon from '@mui/icons-material/Restore'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'

export default function ProductTable({ products, onToggleStatus, onEdit, onAskDelete }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>ชื่อ</TableCell>
          <TableCell>ราคา</TableCell>
          <TableCell>สถานะ</TableCell>
          <TableCell>Visibility</TableCell>
          <TableCell>Tags</TableCell>
          <TableCell align="right">จัดการ</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product._id}>
            <TableCell>{product.name}</TableCell>
            <TableCell>฿ {Number(product.price || 0).toLocaleString()}</TableCell>
            <TableCell>
              <Chip
                label={product.status}
                size="small"
                color={product.status === 'active' ? 'success' : 'default'}
              />
            </TableCell>
            <TableCell>{product.visibility}</TableCell>
            <TableCell>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {(product.tags || []).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
            </TableCell>
            <TableCell align="right">
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  size="small"
                  startIcon={product.status === 'active' ? <ToggleOffIcon /> : <ToggleOnIcon />}
                  variant="outlined"
                  onClick={() => onToggleStatus(product)}
                >
                  {product.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button size="small" startIcon={<EditIcon />} variant="outlined" onClick={() => onEdit(product)}>
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={product.deletedAt ? <RestoreIcon /> : <DeleteIcon />}
                  color={product.deletedAt ? 'success' : 'error'}
                  variant="contained"
                  onClick={() => onAskDelete(product)}
                >
                  {product.deletedAt ? 'Restore' : 'Soft Delete'}
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
        {!products.length && (
          <TableRow>
            <TableCell colSpan={6} align="center">ยังไม่มีสินค้า</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
