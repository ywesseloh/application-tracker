import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query'
import {
  createApplication,
  deleteApplication,
  patchApplications,
  updateApplication,
} from '@/shared/api/applicationsApi'
import {
  applicationMutationKeys,
  applicationScope,
  boardPositionsScope,
} from '@/features/applications/model/mutationKeys'
import { invalidateApplications } from '@/features/applications/model/applicationsCache'

/**
 * Stands in for a real id so that hooks can be called unconditionally while no
 * application is selected. Mutations bound to it never fire in practice.
 */
const NO_ID = -1

export function useCreateApplication() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationKey: applicationMutationKeys.create,
    mutationFn: createApplication,
    onSettled: () => invalidateApplications(queryClient),
  })
  const createMutationState = useLatestMutationState(applicationMutationKeys.create)

  return {
    createMutation,
    createMutationState
  }
}

export function useUpdateApplication(id: number | null) {
  const queryClient = useQueryClient()
  const resolvedId = id ?? NO_ID

  const updateMutation = useMutation({
    mutationKey: applicationMutationKeys.update(resolvedId),
    scope: applicationScope(resolvedId),
    mutationFn: updateApplication,
    onSettled: () => invalidateApplications(queryClient),
  })
  const updateMutationState = useLatestMutationState(
    applicationMutationKeys.update(resolvedId),
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
    scope: applicationScope(id),
    mutationFn: () => deleteApplication(id),
    onSettled: () => invalidateApplications(queryClient),
  })
  const deleteMutationState = useLatestMutationState(applicationMutationKeys.remove(id))

  return {
    deleteMutation,
    deleteMutationState
  }
}

export function useMoveApplications() {
  const queryClient = useQueryClient()
  
  const moveMutation = useMutation({
    mutationKey: applicationMutationKeys.reposition,
    scope: boardPositionsScope,
    mutationFn: patchApplications,
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
