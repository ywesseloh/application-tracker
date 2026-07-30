import { useMutationState } from '@tanstack/react-query'
import type { ApplicationPositionPatch } from '@/shared/api/applicationsApi'
import { applicationMutationKeys } from '@/features/applications/model/mutationKeys'

type ApplicationAction = 'update' | 'delete'

/**
 * Reads mutation state straight from the cache instead of a local observer, so
 * status survives the component that started the mutation being unmounted.
 */
export function useApplicationMutationState(
  id: number | null,
  action: ApplicationAction,
) {
  const key =
    action === 'update'
      ? applicationMutationKeys.update(id ?? -1)
      : applicationMutationKeys.remove(id ?? -1)

  const states = useMutationState({
    filters: { mutationKey: key, exact: true },
    select: (mutation) => ({
      status: mutation.state.status,
      error: mutation.state.error,
    }),
  })

  const latest = id === null ? undefined : states.at(-1)

  return {
    isPending: latest?.status === 'pending',
    error: latest?.status === 'error' ? latest.error : null,
  }
}

export function useApplicationBusy(id: number) {
  const own = useMutationState({
    filters: { mutationKey: applicationMutationKeys.anyFor(id), status: 'pending' },
    select: () => true,
  })

  const repositioning = useMutationState({
    filters: { mutationKey: applicationMutationKeys.reposition, status: 'pending' },
    select: (mutation) =>
      (mutation.state.variables as ApplicationPositionPatch[] | undefined)?.some(
        (patch) => patch.id === id,
      ) ?? false,
  })

  return own.length > 0 || repositioning.some(Boolean)
}
