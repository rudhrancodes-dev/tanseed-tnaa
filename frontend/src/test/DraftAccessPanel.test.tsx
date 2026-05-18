import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import DraftAccessPanel from '../components/DraftAccessPanel'
import type { DraftPaymentController } from '../hooks/useDraftPayment'

function makeController(overrides: Partial<DraftPaymentController> = {}): DraftPaymentController {
  return {
    amountLabel: '₹1,999',
    error: null,
    isPaid: false,
    isProcessing: false,
    status: 'idle',
    unlockDraft: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('DraftAccessPanel', () => {
  it('renders the paywall state and triggers payment when locked', () => {
    const controller = makeController()

    render(<DraftAccessPanel controller={controller} />)

    expect(screen.getByText(/unlock the full application draft/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /pay ₹1,999 and unlock draft/i }))
    expect(controller.unlockDraft).toHaveBeenCalledTimes(1)
  })

  it('renders the unlocked state after payment', () => {
    const controller = makeController({
      isPaid: true,
      status: 'paid',
    })

    render(<DraftAccessPanel controller={controller} />)

    expect(screen.getByText(/draft unlocked/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open application draft/i })).toBeInTheDocument()
  })

  it('shows payment errors inline', () => {
    const controller = makeController({
      error: 'Payment verification failed.',
      status: 'failed',
    })

    render(<DraftAccessPanel controller={controller} />)

    expect(screen.getByText('Payment verification failed.')).toBeInTheDocument()
  })
})
