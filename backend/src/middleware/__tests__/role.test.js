import { describe, expect, it, vi } from 'vitest'
import { requireRole, requireSelfOrAdmin } from '../role.js'

function createRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

describe('RBAC middleware', () => {
  it('allows admins to manage products', () => {
    const req = { user: { id: 'user-1', role: 'admin' } }
    const res = createRes()
    const next = vi.fn()

    requireRole('admin')(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.statusCode).toBe(200)

    console.info('✅ RBAC admin manage product success')
  })

  it('blocks normal users from admin-only actions', () => {
    const req = { user: { id: 'user-2', role: 'user' } }
    const res = createRes()
    const next = vi.fn()

    requireRole('admin')(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ message: 'Forbidden' })

    console.info('✅ RBAC forbidden for basic user')
  })

  it('allows self or admin to proceed', () => {
    const res = createRes()
    const next = vi.fn()

    const selfReq = { user: { id: 'user-1', role: 'user' }, params: { id: 'user-1' } }
    requireSelfOrAdmin(selfReq, res, next)
    expect(next).toHaveBeenCalledTimes(1)

    const adminReq = { user: { id: 'admin-1', role: 'admin' }, params: { id: 'user-2' } }
    requireSelfOrAdmin(adminReq, res, next)
    expect(next).toHaveBeenCalledTimes(2)

    console.info('✅ RBAC self or admin success')
  })

  it('rejects other users when acting on foreign resources', () => {
    const req = { user: { id: 'user-1', role: 'user' }, params: { id: 'user-2' } }
    const res = createRes()
    const next = vi.fn()

    requireSelfOrAdmin(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ message: 'Forbidden' })

    console.info('✅ RBAC foreign access blocked')
  })
})

