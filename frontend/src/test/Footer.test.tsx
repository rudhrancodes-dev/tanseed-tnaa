import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

describe('Footer', () => {
  it('renders the TANSEED branding', () => {
    render(<Footer />)
    expect(screen.getByText('TANSEED')).toBeInTheDocument()
  })

  it('renders footer link groups', () => {
    render(<Footer />)
    expect(screen.getByText('Program')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Legal')).toBeInTheDocument()
  })

  it('renders the copyright line', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument()
  })
})
