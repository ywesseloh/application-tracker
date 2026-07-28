import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  applicationsQueryKey,
  createApplication,
  deleteApplication,
  fetchApplications,
  patchApplications,
  updateApplication,
} from '@/features/applications/api/applicationsApi'
import type { Application } from '@/features/applications/model/types'

export function useApplications() {
  const queryClient = useQueryClient()

  const { isPending, error, data } = useQuery({
    queryKey: applicationsQueryKey,
    queryFn: fetchApplications,
  })

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: applicationsQueryKey }),
    [queryClient],
  )

  const patchMutation = useMutation({
    mutationFn: patchApplications,
    onSettled: invalidate,
  })

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSettled: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: updateApplication,
    onSettled: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSettled: invalidate,
  })

  const applyLocalChange = useCallback(
    (updater: (applications: Application[]) => Application[]): Application[] =>
      queryClient.setQueryData<Application[]>(applicationsQueryKey, (prev) =>
        updater(prev ?? []),
      ) ?? [],
    [queryClient],
  )

  const snapshot = useCallback(
    (): Application[] =>
      (queryClient.getQueryData<Application[]>(applicationsQueryKey) ?? []).map(
        (app) => ({ ...app }),
      ),
    [queryClient],
  )

  const restore = useCallback(
    (applications: Application[]) => {
      queryClient.setQueryData<Application[]>(applicationsQueryKey, applications)
    },
    [queryClient],
  )

  const pauseRefetch = useCallback(() => {
    queryClient.cancelQueries({ queryKey: applicationsQueryKey })
  }, [queryClient])

  return {
    applications: data ?? [],
    isPending,
    error,
    applyLocalChange,
    snapshot,
    restore,
    pauseRefetch,
    persistPositions: patchMutation.mutate,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
  }
}
