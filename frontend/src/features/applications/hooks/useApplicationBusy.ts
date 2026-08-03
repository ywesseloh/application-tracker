import { useMutationState } from '@tanstack/react-query'
import type { ApplicationPositionPatch } from '@/shared/api/applicationsApi'
import { applicationMutationKeys } from '@/features/applications/model/mutationKeys'

export function useApplicationBusy(id: number) {
  const pendingOwnMutations = useMutationState({
    filters: { mutationKey: applicationMutationKeys.anyFor(id), status: 'pending' },
    select: () => true,
  })

  const pendingRepositionings = useMutationState({
    filters: { mutationKey: applicationMutationKeys.reposition, status: 'pending' },
    select: (mutation) =>
      (mutation.state.variables as ApplicationPositionPatch | undefined),
  })
  const pendingOwnRepositionings = pendingRepositionings.filter((patch) => patch?.id === id)

  return pendingOwnMutations.length > 0 || pendingOwnRepositionings.length > 0
}
