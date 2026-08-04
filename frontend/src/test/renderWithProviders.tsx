import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function withQueryClient(queryClient: QueryClient, children: ReactNode) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export function renderHookWithProviders<TResult>(
  hook: () => TResult,
  options?: { queryClient?: QueryClient },
) {
  const client = options?.queryClient ?? createTestQueryClient()

  return {
    queryClient: client,
    ...renderHook(hook, {
      wrapper: ({ children }) => withQueryClient(client, children),
    }),
  }
}
