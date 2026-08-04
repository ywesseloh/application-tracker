import { useQuery } from '@tanstack/react-query'
import { applicationsQueryOptions } from '@/shared/api/applicationsApi'

export function useApplicationsQuery() {
  const { isPending, error, data, refetch } = useQuery(applicationsQueryOptions)

  return {
    applications: data ?? [],
    isPending,
    error,
    hasData: data !== undefined,
    refetch,
  }
}
