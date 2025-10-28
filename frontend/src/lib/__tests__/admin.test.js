import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMock = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}))

vi.mock('../axios', () => ({
  __esModule: true,
  default: apiMock,
}))

import { fetchPendingKyc, approveKyc, rejectKyc } from '../admin'

beforeEach(() => {
  apiMock.get.mockReset()
  apiMock.put.mockReset()
})

describe('admin API helpers', () => {
  it('fetchPendingKyc returns response data', async () => {
    const payload = [{ email: 'alice@example.com' }]
    apiMock.get.mockResolvedValueOnce({ data: payload })

    await expect(fetchPendingKyc()).resolves.toEqual(payload)
    expect(apiMock.get).toHaveBeenCalledWith('/admin/kyc/pending')
  })

  it('approveKyc sends PUT request to approve endpoint', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { success: true } })

    const result = await approveKyc('user-123')
    expect(result).toEqual({ success: true })
    expect(apiMock.put).toHaveBeenCalledWith('/admin/kyc/user-123/approve')
  })

  it('rejectKyc sends PUT request along with note body', async () => {
    apiMock.put.mockResolvedValueOnce({ data: { success: true } })

    await rejectKyc('user-456', 'ข้อมูลไม่ครบ')
    expect(apiMock.put).toHaveBeenCalledWith('/admin/kyc/user-456/reject', {
      note: 'ข้อมูลไม่ครบ',
    })
  })
})
