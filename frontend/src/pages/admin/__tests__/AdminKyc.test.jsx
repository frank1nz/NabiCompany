import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import AdminKyc from '../AdminKyc'

vi.mock('../../../lib/admin', () => ({
  fetchPendingKyc: vi.fn(),
  approveKyc: vi.fn(),
  rejectKyc: vi.fn(),
}))

import { fetchPendingKyc, approveKyc, rejectKyc } from '../../../lib/admin'

const sampleUsers = [
  {
    _id: 'user-1',
    email: 'alice@example.com',
    profile: {
      name: 'Alice',
      dob: '1991-05-06T00:00:00.000Z',
      phone: '0890000000',
      lineId: 'alice-line',
    },
    kyc: {
      idCardImagePath: 'id-card.png',
      selfieWithIdPath: 'selfie.png',
    },
  },
]

beforeAll(() => {
  vi.stubEnv('VITE_UPLOAD_BASE', 'https://files.example.com')
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.unstubAllEnvs()
})

describe('AdminKyc', () => {
  it('renders empty state when no pending requests exist', async () => {
    fetchPendingKyc.mockResolvedValueOnce([])

    render(<AdminKyc />)

    expect(await screen.findByText('ไม่มีรายการรออนุมัติ')).toBeInTheDocument()
    expect(fetchPendingKyc).toHaveBeenCalledTimes(1)
  })

  it('shows an error message when loading users fails', async () => {
    fetchPendingKyc.mockRejectedValueOnce({
      response: { data: { message: 'เกิดข้อผิดพลาด' } },
    })

    render(<AdminKyc />)

    expect(await screen.findByText('เกิดข้อผิดพลาด')).toBeInTheDocument()
  })

  it('allows approving and rejecting a KYC request', async () => {
    fetchPendingKyc.mockResolvedValue(sampleUsers)
    approveKyc.mockResolvedValue({})
    rejectKyc.mockResolvedValue({})

    const user = userEvent.setup()
    render(<AdminKyc />)

    const approveButton = await screen.findByRole('button', { name: 'อนุมัติ' })
    await user.click(approveButton)

    await waitFor(() => {
      expect(approveKyc).toHaveBeenCalledWith('user-1')
    })
    expect(await screen.findByText('อนุมัติสำเร็จ')).toBeInTheDocument()

    const noteInput = screen.getByLabelText('หมายเหตุ (กรณีปฏิเสธ)')
    await user.clear(noteInput)
    await user.type(noteInput, 'ข้อมูลไม่ครบ')

    const rejectButton = screen.getByRole('button', { name: 'ปฏิเสธ' })
    await user.click(rejectButton)

    await waitFor(() => {
      expect(rejectKyc).toHaveBeenCalledWith('user-1', 'ข้อมูลไม่ครบ')
    })
    expect(await screen.findByText('❌ ปฏิเสธสำเร็จ')).toBeInTheDocument()
  })
})
