import { useQuery } from '@tanstack/react-query'
import { applicationsQueryKey, fetchApplications } from '@/shared/api/applicationsApi'

export function useApplicationsQuery() {
  const { isPending, error, data, refetch } = useQuery({
    queryKey: applicationsQueryKey,
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
