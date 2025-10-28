import { beforeEach, describe, expect, it, vi } from 'vitest'

function clone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return value === undefined ? value : JSON.parse(JSON.stringify(value))
}

function makeQuery(getDoc, getLeanDoc = getDoc) {
  return {
    lean: () => Promise.resolve(clone(getLeanDoc())),
    then: (resolve, reject) => {
      try {
        return Promise.resolve(resolve(getDoc()))
      } catch (error) {
        if (reject) {
          return Promise.resolve(reject(error))
        }
        return Promise.reject(error)
      }
    },
    catch: () => Promise.resolve(),
    exec: () => Promise.resolve(getDoc()),
  }
}

const cartModule = vi.hoisted(() => ({
  findOne: vi.fn(),
  create: vi.fn(),
  updateOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
}))

const productModule = vi.hoisted(() => ({
  findOne: vi.fn(),
  find: vi.fn(),
  findById: vi.fn(),
  updateOne: vi.fn(),
}))

const orderModule = vi.hoisted(() => ({
  create: vi.fn(),
}))

const userModule = vi.hoisted(() => ({
  findById: vi.fn(),
}))

const promptPayModule = vi.hoisted(() => ({
  generatePromptPayPayload: vi.fn(),
}))

const sessionMock = vi.hoisted(() => ({
  withTransaction: vi.fn(async (fn) => {
    await fn()
  }),
  endSession: vi.fn(),
}))

class MockObjectId {
  constructor(value = `mock-${Math.random().toString(16).slice(2, 10)}`) {
    this.value = value
  }

  toString() {
    return this.value
  }
}

MockObjectId.isValid = (value) => typeof value === 'string' && value.length > 0

vi.mock('../../models/Cart.js', () => ({
  __esModule: true,
  default: cartModule,
}))

vi.mock('../../models/Product.js', () => ({
  __esModule: true,
  default: productModule,
}))

vi.mock('../../models/Order.js', () => ({
  __esModule: true,
  default: orderModule,
}))

vi.mock('../../models/User.js', () => ({
  __esModule: true,
  default: userModule,
}))

vi.mock('../../utils/promptpay.js', () => ({
  __esModule: true,
  generatePromptPayPayload: promptPayModule.generatePromptPayPayload,
}))

vi.mock('mongoose', () => ({
  __esModule: true,
  default: {
    Types: { ObjectId: MockObjectId },
    startSession: vi.fn(async () => sessionMock),
  },
  Types: { ObjectId: MockObjectId },
  startSession: vi.fn(async () => sessionMock),
}))

let addCartItem
let checkoutCart
let updateCartItem

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

function setupCartState({ initialQuantity = 0, stock = 10 } = {}) {
  const cartDoc = {
    _id: 'cart-1',
    user: 'user-1',
    items: initialQuantity
      ? [{ product: 'prod-1', quantity: initialQuantity }]
      : [],
    save: vi.fn(async () => {
      cartDoc.updatedAt = new Date()
      return cartDoc
    }),
  }

  const cartLean = () => ({
    _id: cartDoc._id,
    user: cartDoc.user,
    items: cartDoc.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    })),
    updatedAt: cartDoc.updatedAt ?? new Date('2025-01-01T00:00:00.000Z'),
  })

  cartModule.findOne.mockImplementation(() => makeQuery(() => cartDoc, cartLean))
  cartModule.create.mockImplementation(async () => cartDoc)
  cartModule.updateOne.mockResolvedValue({})

  const productPayload = {
    _id: 'prod-1',
    name: 'Nabi Reserve 2025',
    description: 'Limited edition',
    price: 1500,
    stock,
    images: ['reserve.png'],
    sku: 'NB-RES-2025',
    slug: 'nabi-reserve-2025',
  }

  productModule.findOne.mockImplementation(() => makeQuery(() => productPayload))
  productModule.find.mockImplementation(() => makeQuery(() => [productPayload]))
  productModule.findById.mockImplementation(() => makeQuery(() => productPayload))
  productModule.updateOne.mockResolvedValue({ modifiedCount: 1 })

  return { cartDoc, productPayload }
}

beforeEach(async () => {
  vi.clearAllMocks()
  promptPayModule.generatePromptPayPayload.mockReset()
  process.env.PROMPTPAY_ID = '0812345678'
  process.env.PROMPTPAY_PROXY_TYPE = 'phone'
  process.env.PROMPTPAY_BANK_CODE = ''
  process.env.PROMPTPAY_MERCHANT_NAME = 'NABI COMPANY'
  process.env.PROMPTPAY_MERCHANT_CITY = 'BANGKOK'
  ;({ addCartItem, checkoutCart, updateCartItem } = await import('../order.controller.js'))
})

describe('order.controller cart workflow', () => {
  it('adds a product into the cart and recalculates totals', async () => {
    const { cartDoc, productPayload } = setupCartState({ initialQuantity: 0, stock: 5 })

    const res = createRes()
    const req = {
      user: { id: 'user-1' },
      body: { productId: 'prod-1', quantity: 2 },
    }

    await addCartItem(req, res)

    expect(productModule.findOne).toHaveBeenCalled()
    expect(cartDoc.save).toHaveBeenCalled()
    expect(res.body?.items).toHaveLength(1)
    expect(res.body?.items?.[0]).toMatchObject({
      productId: 'prod-1',
      quantity: 2,
      unitPrice: productPayload.price,
      lineTotal: productPayload.price * 2,
      product: {
        name: 'Nabi Reserve 2025',
        price: productPayload.price,
        stock: productPayload.stock,
      },
    })
    expect(res.body?.totals).toEqual({ amount: productPayload.price * 2, quantity: 2 })
    expect(res.statusCode).toBe(200)

    console.info('✅ Cart system success')
  })

  it('creates an order and PromptPay payload during checkout', async () => {
    const { cartDoc, productPayload } = setupCartState({ initialQuantity: 2, stock: 5 })

    promptPayModule.generatePromptPayPayload.mockReturnValue({
      payload: 'PROMPTPAY:QRDATA',
      proxyId: '0066812345678',
    })

    const orderResponse = {
      createdAt: new Date('2025-01-02T00:00:00.000Z'),
      updatedAt: new Date('2025-01-02T00:00:00.000Z'),
    }

    orderModule.create.mockImplementation(async (docs) => {
      const doc = {
        ...docs[0],
        ...orderResponse,
        toObject() {
          const { toObject: _, ...rest } = this
          return rest
        },
      }
      return [doc]
    })

    userModule.findById.mockImplementation(() =>
      makeQuery(() => ({
        _id: 'user-1',
        profile: { address: '123 Main Street' },
      })),
    )

    const res = createRes()
    const req = {
      user: { id: 'user-1' },
      body: { shippingAddress: '55 River Road', note: 'Handle with care' },
    }

    await checkoutCart(req, res)

    expect(promptPayModule.generatePromptPayPayload).toHaveBeenCalledWith(
      expect.objectContaining({
        target: '0812345678',
        amount: productPayload.price * 2,
      }),
    )
    expect(productModule.updateOne).toHaveBeenCalled()
    expect(orderModule.create).toHaveBeenCalled()
    expect(cartModule.updateOne).toHaveBeenCalledWith(
      { _id: cartDoc._id },
      { $set: { items: [] } },
      expect.any(Object),
    )
    expect(res.statusCode).toBe(201)
    expect(res.body?.order).toMatchObject({
      status: 'pending',
      total: productPayload.price * 2,
      payment: {
        payload: 'PROMPTPAY:QRDATA',
        status: 'pending',
      },
    })
    expect(res.body?.cart).toEqual({
      items: [],
      totals: { amount: 0, quantity: 0 },
    })

    console.info('✅ PromptPay checkout success')
  })

  it('merges quantities when adding the same product repeatedly', async () => {
    const { cartDoc, productPayload } = setupCartState({ initialQuantity: 1, stock: 10 })

    const res = createRes()
    const req = {
      user: { id: 'user-1' },
      body: { productId: 'prod-1', quantity: 2 },
    }

    await addCartItem(req, res)

    expect(cartDoc.items).toHaveLength(1)
    expect(cartDoc.items[0].quantity).toBe(3)
    expect(res.body?.items?.[0].quantity).toBe(3)
    expect(res.body?.totals).toEqual({ amount: productPayload.price * 3, quantity: 3 })

    console.info('✅ Cart merge success')
  })

  it('removes items when quantity is updated to zero or less', async () => {
    const { cartDoc } = setupCartState({ initialQuantity: 2, stock: 5 })

    const res = createRes()
    const req = {
      user: { id: 'user-1' },
      params: { productId: 'prod-1' },
      body: { quantity: 0 },
    }

    await updateCartItem(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body?.items ?? []).toHaveLength(0)
    expect(cartDoc.items).toHaveLength(0)

    console.info('✅ Cart remove invalid quantity')
  })

  it('handles insufficient stock gracefully at checkout', async () => {
    setupCartState({ initialQuantity: 2, stock: 5 })

    promptPayModule.generatePromptPayPayload.mockReturnValue({
      payload: 'PROMPTPAY:QRDATA',
      proxyId: '0066812345678',
    })

    orderModule.create.mockRejectedValue(new Error('should not be called'))
    productModule.updateOne.mockResolvedValueOnce({ modifiedCount: 0 })

    userModule.findById.mockImplementation(() =>
      makeQuery(() => ({
        _id: 'user-1',
        profile: { address: '123 Main Street' },
      })),
    )

    const res = createRes()
    const req = {
      user: { id: 'user-1' },
      body: { shippingAddress: '55 River Road' },
    }

    await checkoutCart(req, res)

    expect(res.statusCode).toBe(409)
    expect(res.body?.message).toContain('สินค้า')
    expect(res.body?.cart?.items).toBeDefined()

    console.info('✅ Checkout handles insufficient stock')
  })
})
