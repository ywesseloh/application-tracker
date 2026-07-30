import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  applyLocalChange,
  clearSettledMutations,
  invalidateApplications,
  pauseApplicationsRefetch,
  restoreApplications,
  snapshotApplications,
} from '@/features/applications/model/applicationsCache'
import type { Application } from '@/features/applications/model/types'

export function useApplicationsCache() {
  const queryClient = useQueryClient()

  return {
    applyLocalChange: useCallback(
      (updater: (applications: Application[]) => Application[]) =>
        applyLocalChange(queryClient, updater),
      [queryClient],
    ),
    snapshot: useCallback(
      () => snapshotApplications(queryClient),
      [queryClient],
    ),
    restore: useCallback(
      (applications: Application[]) =>
        restoreApplications(queryClient, applications),
      [queryClient],
    ),
    pauseRefetch: useCallback(
      () => pauseApplicationsRefetch(queryClient),
      [queryClient],
    ),
    invalidate: useCallback(
      () => invalidateApplications(queryClient),
      [queryClient],
    ),
    clearSettledMutations: useCallback(
      (mutationKey: readonly unknown[]) =>
        clearSettledMutations(queryClient, mutationKey),
      [queryClient],
    ),
  }
}
