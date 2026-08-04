import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query'
import {
  createApplication,
  deleteApplication,
  moveApplication,
  updateApplication,
  type ApplicationInput,
  type ApplicationPositionPatch,
} from '@/shared/api/applicationsApi'
import {
  applicationMutationKeys,
  boardWritesScope,
} from '@/features/applications/model/mutationKeys'
import { invalidateApplications } from '@/features/applications/model/applicationsCache'

export function useCreateApplication() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationKey: applicationMutationKeys.create,
    scope: boardWritesScope,
    mutationFn: createApplication,
    onSettled: () => invalidateApplications(queryClient),
  })
  const createMutationState = useLatestMutationState(applicationMutationKeys.create)

  return {
    createMutation,
    createMutationState
  }
}

export function useUpdateApplication(id: number) {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationKey: applicationMutationKeys.update(id),
    scope: boardWritesScope,
    mutationFn: (application: ApplicationInput) => updateApplication(application, id),
    onSettled: () => invalidateApplications(queryClient),
  })
  const updateMutationState = useLatestMutationState(
    applicationMutationKeys.update(id),
  )

  return {
    updateMutation,
    updateMutationState
  }
}

export function useDeleteApplication(id: number) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationKey: applicationMutationKeys.remove(id),
    scope: boardWritesScope,
    mutationFn: () => deleteApplication(id),
    onSettled: () => invalidateApplications(queryClient),
  })
  const deleteMutationState = useLatestMutationState(applicationMutationKeys.remove(id))

  return {
    deleteMutation,
    deleteMutationState
  }
}

export function useMoveApplication() {
  const queryClient = useQueryClient()

  const moveMutation = useMutation({
    mutationKey: applicationMutationKeys.reposition,
    scope: boardWritesScope,
    mutationFn: (patch: ApplicationPositionPatch) => moveApplication(patch, patch.id),
    onSettled: () => invalidateApplications(queryClient),
  })
  const moveMutationState = useLatestMutationState(applicationMutationKeys.reposition)

  return {
    moveMutation,
    moveMutationState
  }
}

/**
 * Reads mutation state straight from the cache instead of a local observer, so
 * status survives the component that started the mutation being unmounted and
 * clears again once the mutation is dropped from the cache.
 */
function useLatestMutationState(key: readonly unknown[]) {
  const states = useMutationState({
    filters: { mutationKey: key, exact: true },
    select: (mutation) => ({
      isPending: mutation.state.status === 'pending',
      error: mutation.state.error,
    }),
  })

  return states.at(-1) ?? { isPending: false, error: null }
}
