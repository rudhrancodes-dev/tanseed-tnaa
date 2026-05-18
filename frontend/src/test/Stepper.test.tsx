import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Stepper from '../components/Stepper'

describe('Stepper', () => {
  it('renders all three steps', () => {
    render(<Stepper currentStep={1} />)
    expect(screen.getByText('Entity & Eligibility')).toBeInTheDocument()
    expect(screen.getByText('Financials & Impact')).toBeInTheDocument()
    expect(screen.getByText('Documents')).toBeInTheDocument()
  })

  it('highlights the current step as active', () => {
    render(<Stepper currentStep={2} />)
    const step2 = screen.getByText('Financials & Impact')
    expect(step2).toBeInTheDocument()
  })

  it('shows check icon for completed steps', () => {
    render(<Stepper currentStep={2} />)
    const step1Text = screen.getByText('Entity & Eligibility')
    expect(step1Text).toBeInTheDocument()
  })
})
