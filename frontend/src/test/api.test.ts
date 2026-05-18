import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockAppData = {
  entity: {
    entityName: 'Test Startup',
    registrationType: 'Private Limited',
    cin: '',
    location: 'Tamil Nadu',
    indianOwnership: 100,
    tansimId: 'TAN123',
    dpiitId: 'DPIIT456',
    employees: 10,
    description: 'Innovative AI startup based in Chennai',
  },
  financials: {
    avgProfit3y: 250000,
    prioritySector: 'Deep Tech/AI',
    trlLevel: 5,
    noDues: true,
    notBlacklisted: true,
  },
  documents: {
    pitchDeckUrl: 'deck.pdf',
    financialModelUrl: 'model.xlsx',
    prototypeVideoUrl: 'https://youtube.com/watch?v=test',
    additionalDocsUrls: [],
  },
}

describe('deriveLocalResult', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  })

  it('returns PASS for valid TANSEED-eligible data', async () => {
    // Import the API functions
    const { runEligibilityCheck } = await import('../api')
    // The fallback path will be hit (no server running)
    const result = await runEligibilityCheck(mockAppData)
    expect(result.status).toBe('PASS')
  })

  it('returns FAIL when indianOwnership is below 51%', async () => {
    const { runEligibilityCheck } = await import('../api')
    const badData = {
      ...mockAppData,
      entity: { ...mockAppData.entity, indianOwnership: 40 },
      financials: mockAppData.financials,
    }
    const result = await runEligibilityCheck(badData)
    expect(result.status).toBe('FAIL')
  })

  it('returns FAIL when avgProfit > 500000', async () => {
    const { runEligibilityCheck } = await import('../api')
    const badData = {
      ...mockAppData,
      financials: { ...mockAppData.financials, avgProfit3y: 600000 },
    }
    const result = await runEligibilityCheck(badData)
    expect(result.status).toBe('FAIL')
  })

  it('returns REVIEW for low TRL', async () => {
    const { runEligibilityCheck } = await import('../api')
    const reviewData = {
      ...mockAppData,
      financials: { ...mockAppData.financials, trlLevel: 2 },
    }
    const result = await runEligibilityCheck(reviewData)
    expect(result.status).toBe('REVIEW')
  })
})

describe('payment api wrappers', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('posts a Razorpay order request with the draft unlock metadata', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        keyId: 'rzp_test_123',
        orderId: 'order_123',
        amount: 199900,
        currency: 'INR',
        applicationReference: 'draft-test-123',
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const { createDraftPaymentOrder } = await import('../api')
    const result = await createDraftPaymentOrder({
      applicationReference: 'draft-test-123',
      companyName: 'Test Startup',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/payments/razorpay/order',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(result.orderId).toBe('order_123')
  })

  it('posts the Razorpay verification payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        paid: true,
        applicationReference: 'draft-test-123',
        paymentId: 'pay_123',
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const { verifyDraftPayment } = await import('../api')
    const result = await verifyDraftPayment({
      applicationReference: 'draft-test-123',
      orderId: 'order_123',
      paymentId: 'pay_123',
      signature: 'sig_123',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/payments/razorpay/verify',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(result.paid).toBe(true)
  })
})
