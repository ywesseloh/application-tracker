import type { QueryClient } from '@tanstack/react-query'
import { applicationsQueryKey } from '@/shared/api/applicationsApi'
import type { Application } from '@/features/applications/model/types'

export function invalidateApplications(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: applicationsQueryKey })
}

export function pauseApplicationsRefetch(queryClient: QueryClient) {
  return queryClient.cancelQueries({ queryKey: applicationsQueryKey })
}

export function applyLocalChange(
  queryClient: QueryClient,
  updater: (applications: Application[]) => Application[],
): Application[] {
  return (
    queryClient.setQueryData<Application[]>(applicationsQueryKey, (prev) =>
      updater(prev ?? []),
    ) ?? []
  )
}

export function snapshotApplications(queryClient: QueryClient): Application[] {
  return (
    queryClient.getQueryData<Application[]>(applicationsQueryKey) ?? []
  ).map((application) => ({ ...application }))
}

export function restoreApplications(
  queryClient: QueryClient,
  applications: Application[],
) {
  queryClient.setQueryData<Application[]>(applicationsQueryKey, applications)
}
