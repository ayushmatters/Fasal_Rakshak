import React from 'react'
import { render, screen } from '@testing-library/react'
import ScanResultCard from '../src/features/scan/ScanResultCard'

test('renders scan result card with recommendations', () => {
  const dummy = { disease: 'Test', confidence: 0.5, recommendations: ['One', 'Two'], timestamp: Date.now() }
  render(<ScanResultCard result={dummy} />)
  expect(screen.getByText(/Test/i)).toBeInTheDocument()
  expect(screen.getByText(/Recommendations/i)).toBeInTheDocument()
})
