import { beforeEach, describe, expect, it, vi } from 'vitest'

const userModelMock = vi.hoisted(() => ({
  findOne: vi.fn(),
}))

const bcryptMock = vi.hoisted(() => ({
  compare: vi.fn(),
  hash: vi.fn(),
}))

const jwtMock = vi.hoisted(() => ({
  sign: vi.fn(),
}))

vi.mock('../../models/User.js', () => ({
  __esModule: true,
  default: userModelMock,
}))

vi.mock('bcryptjs', () => ({
  __esModule: true,
  default: bcryptMock,
}))

vi.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: jwtMock,
}))

let login

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

beforeEach(async () => {
  vi.clearAllMocks()
  process.env.JWT_SECRET = 'test-secret'
  process.env.JWT_EXPIRES = '7d'
  ;({ login } = await import('../auth.controller.js'))
})

describe('auth.controller.login', () => {
  it('authenticates a user and returns profile payload', async () => {
    const req = {
      body: { email: 'user@example.com', password: 'hunter2' },
    }
    const res = createRes()

    const now = new Date('2025-01-01T00:00:00.000Z')
    const userDocument = {
      _id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
      role: 'user',
      ageVerified: true,
      profile: {
        name: 'Nabi',
        dob: now,
        phone: '0812345678',
        lineId: 'nabi-line',
        facebookProfileUrl: 'https://facebook.com/nabi',
        address: '123 Nabi Street',
      },
      kyc: {
        status: 'approved',
        idCardImagePath: 'id-card.png',
        selfieWithIdPath: 'selfie.png',
        reviewedAt: now,
        reviewedBy: 'admin-1',
        note: 'All good',
      },
    }

    userModelMock.findOne.mockResolvedValue(userDocument)
    bcryptMock.compare.mockResolvedValue(true)
    jwtMock.sign.mockReturnValue('jwt-token-123')

    await login(req, res)

    expect(userModelMock.findOne).toHaveBeenCalledWith({ email: 'user@example.com' })
    expect(bcryptMock.compare).toHaveBeenCalledWith('hunter2', 'hashed-password')
    expect(jwtMock.sign).toHaveBeenCalledWith(
      { sub: 'user-1', role: 'user' },
      'test-secret',
      { expiresIn: '7d' },
    )

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      token: 'jwt-token-123',
      user: {
        id: 'user-1',
        email: 'user@example.com',
        role: 'user',
        ageVerified: true,
        profile: {
          name: 'Nabi',
          phone: '0812345678',
          lineId: 'nabi-line',
        },
        kycStatus: 'approved',
        isVerified: true,
        canOrderViaLine: true,
      },
      nextStep: 'Ready to create lead',
      redirectBase: '/app/profile',
    })

    console.info('✅ Authentication success')
  })
})
