import { useEffect, useMemo, useState } from 'react'
import {
  Box, Paper, Toolbar, Typography, Stack, Button, TextField, Select, MenuItem,
  InputLabel, FormControl, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Divider, Alert, CircularProgress, InputAdornment
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import RestoreFromTrashRoundedIcon from '@mui/icons-material/RestoreFromTrashRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

import {
  adminListNews,
  adminCreateNews,
  adminUpdateNews,
  adminSoftDeleteNews,
  adminRestoreNews,
} from '../../lib/news'

const STATUS = ['active', 'inactive']
const VIS = ['public', 'hidden']

export default function AdminNews() {
  const theme = useTheme()
  const brand = theme.palette.brand
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return rows
    return rows.filter(r => `${r.title} ${r.description}`.toLowerCase().includes(qq))
  }, [rows, q])

  const load = async () => {
    setLoading(true)
    setErr('')
    try {
      const data = await adminListNews()
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setErr('โหลดข้อมูลไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // form state
  const [editing, setEditing] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('active')
  const [visibility, setVisibility] = useState('public')
  const [priority, setPriority] = useState(0)
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setEditing(null)
    setTitle('')
    setDescription('')
    setStatus('active')
    setVisibility('public')
    setPriority(0)
    setStartsAt('')
    setEndsAt('')
    setImage(null)
  }

  const onEdit = (row) => {
    setEditing(row)
    setTitle(row.title || '')
    setDescription(row.description || '')
    setStatus(row.status || 'active')
    setVisibility(row.visibility || 'public')
    setPriority(Number(row.priority || 0))
    setStartsAt(row.startsAt ? isoLocal(row.startsAt).slice(0, 16) : '')
    setEndsAt(row.endsAt ? isoLocal(row.endsAt).slice(0, 16) : '')
    setImage(null)
  }

  const buildForm = () => {
    const fd = new FormData()
    fd.append('title', title)
    fd.append('description', description)
    fd.append('status', status)
    fd.append('visibility', visibility)
    fd.append('priority', String(priority || 0))
    if (startsAt) fd.append('startsAt', new Date(startsAt).toISOString())
    if (endsAt) fd.append('endsAt', new Date(endsAt).toISOString())
    if (image) fd.append('image', image)
    return fd
  }

  const submit = async (e) => {
    e?.preventDefault?.()
    setSaving(true)
    setErr('')
    setOk('')
    try {
      if (editing) {
        await adminUpdateNews(editing.id || editing._id, buildForm())
        setOk('บันทึกการแก้ไขแล้ว')
      } else {
        await adminCreateNews(buildForm())
        setOk('เพิ่มข่าวแล้ว')
      }
      resetForm()
      await load()
    } catch (e) {
      setErr('บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  const softDelete = async (row) => {
    if (!row) return
    setSaving(true)
    setErr('')
    try {
      await adminSoftDeleteNews(row.id || row._id)
      await load()
    } catch (e) {
      setErr('ลบไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  const restore = async (row) => {
    setSaving(true)
    setErr('')
    try {
      await adminRestoreNews(row.id || row._id)
      await load()
    } catch (e) {
      setErr('กู้คืนไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 3, mb: 3 }}>
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" fontWeight={900} sx={{ color: brand?.navy || theme.palette.text.primary }}>
            News Management
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="ค้นหา..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              )}}
            />
            <Button onClick={load} variant="outlined" startIcon={<RefreshIcon />} sx={{ fontWeight: 800 }}>
              รีเฟรช
            </Button>
          </Stack>
        </Toolbar>

        {(ok || err) && (
          <Box sx={{ mt: 1.5 }}>
            {ok && <Alert severity="success" onClose={() => setOk('')}>{ok}</Alert>}
            {err && <Alert severity="error" onClose={() => setErr('')}>{err}</Alert>}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Form */}
        <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 1.5 }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={3} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select label="Visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                {VIS.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField type="number" label="Priority" value={priority} onChange={(e) => setPriority(Number(e.target.value || 0))} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField type="datetime-local" label="Starts At" InputLabelProps={{ shrink: true }} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} fullWidth />
            <TextField type="datetime-local" label="Ends At" InputLabelProps={{ shrink: true }} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
            <Button component="label" variant="outlined" sx={{ fontWeight: 800 }}>
              {image ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
              <input type="file" hidden accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            </Button>
            {image && <Typography variant="body2" color="text.secondary">{image.name}</Typography>}
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained" disabled={saving} startIcon={<AddRoundedIcon />} sx={{ fontWeight: 900 }}>
              {editing ? 'บันทึกการแก้ไข' : 'เพิ่มข่าว'}
            </Button>
            {editing && (
              <Button onClick={resetForm} variant="text" disabled={saving}>ยกเลิก</Button>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Table */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Visibility</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} hover sx={{ opacity: r.deletedAt ? 0.5 : 1 }}>
                  <TableCell>{r.title}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{r.status}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{r.visibility}</TableCell>
                  <TableCell>{period(r)}</TableCell>
                  <TableCell>{r.priority || 0}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {!r.deletedAt && (
                        <IconButton size="small" onClick={() => onEdit(r)}><EditRoundedIcon fontSize="small" /></IconButton>
                      )}
                      {!r.deletedAt ? (
                        <IconButton size="small" color="error" onClick={() => softDelete(r)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
                      ) : (
                        <IconButton size="small" color="primary" onClick={() => restore(r)}><RestoreFromTrashRoundedIcon fontSize="small" /></IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  )
}

function isoLocal(d) {
  try {
    const dt = new Date(d)
    const tzoff = dt.getTimezoneOffset() * 60000
    return new Date(dt - tzoff).toISOString()
  } catch { return '' }
}

function period(r) {
  const a = r.startsAt ? new Date(r.startsAt).toLocaleString() : ''
  const b = r.endsAt ? new Date(r.endsAt).toLocaleString() : ''
  if (!a && !b) return '-'
  if (a && !b) return `${a} -`
  if (!a && b) return `- ${b}`
  return `${a} - ${b}`
}

