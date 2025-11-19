import React from 'react'
import { render, screen } from '@testing-library/react'
import App from '../src/App'

test('renders ScanPage and upload input', () => {
  render(<App />)
  expect(screen.getByText(/Scan Crop/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/file-input/i)).toBeInTheDocument()
  expect(screen.getByText(/Show Queue/i)).toBeInTheDocument()
})
