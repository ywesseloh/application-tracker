import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { NetworkError } from '@/shared/api/apiClient'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Board data is fresh for 5m; focus/reconnect refetch only when stale
      // (mutations still force freshness via invalidate).
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) =>
        error instanceof NetworkError && failureCount < 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
