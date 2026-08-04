import { useQuery } from '@tanstack/react-query'
import {
  applicationsQueryOptions,
  fetchApplications,
} from '@/shared/api/applicationsApi'

export function useApplicationsQuery() {
  const { isPending, error, data, refetch } = useQuery({
    ...applicationsQueryOptions,
    // Named import so Vitest mocks of fetchApplications apply at call time.
    queryFn: fetchApplications,
  })

  return {
    applications: data ?? [],
    isPending,
    error,
    hasData: data !== undefined,
    refetch,
  }
}
