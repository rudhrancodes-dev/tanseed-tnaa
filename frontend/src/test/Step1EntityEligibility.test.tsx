import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Step1EntityEligibility from '../components/Step1EntityEligibility'
import { ApplicationProvider } from '../context/ApplicationContext'

describe('Step1EntityEligibility', () => {
  it('shows validation errors before allowing progression', () => {
    render(
      <ApplicationProvider>
        <Step1EntityEligibility />
      </ApplicationProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /continue to financials/i }))

    expect(screen.getByText('Entity name is required')).toBeInTheDocument()
    expect(screen.getByText('Registration type is required')).toBeInTheDocument()
    expect(screen.getByText('Location is required')).toBeInTheDocument()
    expect(screen.getByText('TANSIM ID is required')).toBeInTheDocument()
    expect(screen.getByText('DPIIT ID is required')).toBeInTheDocument()
  })
})
