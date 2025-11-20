import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AuthProvider from '../src/app/AuthProvider'
import App from '../src/App'

test('renders ScanPage and upload input', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  )
  expect(screen.getAllByText(/Scan Crop/i).length).toBeGreaterThan(0)
  expect(screen.getByLabelText(/file-input/i)).toBeInTheDocument()
  expect(screen.getByText(/Show Queue/i)).toBeInTheDocument()
})
