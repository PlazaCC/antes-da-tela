import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function customRender(ui: React.ReactElement, options?: Record<string, unknown>) {
  const queryClient = new QueryClient()
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}

// re-export everything
export * from '@testing-library/react'
export { customRender as render }
