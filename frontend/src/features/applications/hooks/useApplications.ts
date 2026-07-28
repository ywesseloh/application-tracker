import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  applicationsQueryKey,
  createApplication,
  deleteApplication,
  fetchApplications,
  patchApplications,
  updateApplication,
} from '@/shared/api/applicationsApi'
import { getErrorMessage } from '@/shared/api/apiClient'
import type { Application } from '@/features/applications/model/types'

export function useApplications() {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)

  const { isPending, error, data, refetch } = useQuery({
    queryKey: applicationsQueryKey,
    queryFn: fetchApplications,
  })

  const hasData = data !== undefined

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: applicationsQueryKey }),
    [queryClient],
  )

  const clearActionError = useCallback(() => setActionError(null), [])

  const patchMutation = useMutation({
    mutationFn: patchApplications,
    onSuccess: clearActionError,
    onError: (err) =>
      setActionError(getErrorMessage(err, 'Couldn’t save board changes.')),
    onSettled: invalidate,
  })

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: clearActionError,
    onError: (err) =>
      setActionError(getErrorMessage(err, 'Couldn’t create the application.')),
    onSettled: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: updateApplication,
    onSuccess: clearActionError,
    onError: (err) =>
      setActionError(getErrorMessage(err, 'Couldn’t save the application.')),
    onSettled: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: clearActionError,
    onError: (err) =>
      setActionError(getErrorMessage(err, 'Couldn’t delete the application.')),
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
    hasData,
    refetch,
    actionError,
    clearActionError,
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
