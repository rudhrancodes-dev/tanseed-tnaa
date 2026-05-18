import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Hero from '../components/Hero'

describe('Hero', () => {
  it('renders the main headline', () => {
    render(<Hero onStart={() => {}} />)
    expect(screen.getByRole('heading', { name: /fast-track your tanseed application/i })).toBeInTheDocument()
  })

  it('renders the CTA button', () => {
    render(<Hero onStart={() => {}} />)
    expect(screen.getByText('Start New Application')).toBeInTheDocument()
  })

  it('calls onStart when CTA is clicked', () => {
    const onStart = vi.fn()
    render(<Hero onStart={onStart} />)
    fireEvent.click(screen.getByText('Start New Application'))
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('renders the status check link', () => {
    render(<Hero onStart={() => {}} />)
    expect(screen.getByRole('link', { name: /check existing status/i })).toBeInTheDocument()
  })
})
