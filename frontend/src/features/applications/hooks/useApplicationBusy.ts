import { useMutationState } from '@tanstack/react-query'
import type { ApplicationPositionPatch } from '@/shared/api/applicationsApi'
import { applicationMutationKeys } from '@/features/applications/model/mutationKeys'

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
