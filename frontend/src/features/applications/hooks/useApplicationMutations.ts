import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query'
import {
  createApplication,
  deleteApplication,
  updateApplication,
} from '@/shared/api/applicationsApi'
import type { ApplicationInput } from '@/shared/api/applicationsApi'
import {
  applicationMutationKeys,
  applicationScope,
} from '@/features/applications/model/mutationKeys'
import { invalidateApplications } from '@/features/applications/model/applicationsCache'
import type { Application } from '@/features/applications/model/types'

/**
 * Stands in for a real id so that hooks can be called unconditionally while no
 * application is selected. Mutations bound to it reject instead of firing.
 */
const NO_ID = -1

function requireId(id: number | null): number {
  if (id === null) throw new Error('No application selected.')
  return id
}

export function useCreateApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: applicationMutationKeys.create,
    mutationFn: (application: ApplicationInput) => createApplication(application),
    onSettled: () => invalidateApplications(queryClient),
  })
}

export function useUpdateApplication(id: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: applicationMutationKeys.update(id ?? NO_ID),
    scope: applicationScope(id ?? NO_ID),
    mutationFn: (application: Application) => {
      requireId(id)
      return updateApplication(application)
    },
    onSettled: () => invalidateApplications(queryClient),
  })
}

export function useDeleteApplication(id: number | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: applicationMutationKeys.remove(id ?? NO_ID),
    scope: applicationScope(id ?? NO_ID),
    mutationFn: () => deleteApplication(requireId(id)),
    onSettled: () => invalidateApplications(queryClient),
  })
}

type ApplicationAction = 'update' | 'delete'

/**
 * Reads mutation state straight from the cache instead of a local observer, so
 * status survives the component that started the mutation being unmounted and
 * clears again once the mutation is dropped from the cache.
 */
function useLatestMutationState(key: readonly unknown[], enabled: boolean) {
  const states = useMutationState({
    filters: { mutationKey: key, exact: true },
    select: (mutation) => ({
      status: mutation.state.status,
      error: mutation.state.error,
    }),
  })

  const latest = enabled ? states.at(-1) : undefined

  return {
    isPending: latest?.status === 'pending',
    error: latest?.status === 'error' ? latest.error : null,
  }
}

export function useCreateApplicationState() {
  return useLatestMutationState(applicationMutationKeys.create, true)
}

export function useApplicationMutationState(
  id: number | null,
  action: ApplicationAction,
) {
  const key =
    action === 'update'
      ? applicationMutationKeys.update(id ?? NO_ID)
      : applicationMutationKeys.remove(id ?? NO_ID)

  return useLatestMutationState(key, id !== null)
}
