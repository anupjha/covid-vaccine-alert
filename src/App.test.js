import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from './App'

test('check first div text', () => {
  render(<App />)
  const linkElement = screen.getByText(/Covid19 India Vaccination Alerts/i)
  expect(linkElement).toBeInTheDocument()
})
