import { describe, expect, it } from 'vitest'
import { generatePromptPayPayload } from '../promptpay.js'

describe('generatePromptPayPayload', () => {
  it('creates a valid payload for a phone number proxy', () => {
    const result = generatePromptPayPayload({
      target: '0812345678',
      amount: 100.5,
    })

    expect(result).toEqual({
      payload:
        '00020101021129370016A000000677010111011300668123456785204000053037645406100.505802TH6304ACCB',
      proxyId: '0066812345678',
    })

    console.info('✅ Generate PromptPay QR code success')
  })

  it('sanitises optional fields and embeds merchant metadata', () => {
    const { payload, proxyId } = generatePromptPayPayload({
      target: '1234567890123',
      amount: 99,
      reference: 'ORDER-12345/TH',
      merchantName: 'Nabi Company',
      merchantCity: 'Bangkok',
    })

    expect(proxyId).toBe('1234567890123')
    expect(payload).toContain('5912Nabi Company')
    expect(payload).toContain('6007Bangkok')
    expect(payload).toContain('62160112ORDER12345TH')
    expect(payload.endsWith('6304D94B')).toBe(true)

    console.info('✅ PromptPay metadata sanitised')
  })

  it('supports explicit bank account proxy IDs', () => {
    const result = generatePromptPayPayload({
      target: '1234567890',
      amount: 10,
      targetType: 'bank',
      bankCode: '123',
    })

    expect(result.proxyId).toBe('123001234567890')
    expect(result.payload).toContain('011512300123456789')

    console.info('✅ PromptPay bank proxy success')
  })

  it('throws when amount is missing or invalid', () => {
    expect(() =>
      generatePromptPayPayload({ target: '0812345678', amount: 0 }),
    ).toThrow('Amount must be a positive number')

    console.info('✅ PromptPay rejects invalid amount')
  })

  it('throws when phone target is malformed', () => {
    expect(() =>
      generatePromptPayPayload({
        target: '991234567',
        amount: 50,
        targetType: 'phone',
      }),
    ).toThrow('Phone number must have 10 digits and start with 0')

    console.info('✅ PromptPay validates phone proxy')
  })
})
