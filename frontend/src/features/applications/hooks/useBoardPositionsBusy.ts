import { useMutationState } from '@tanstack/react-query'
import { applicationMutationKeys } from '@/features/applications/model/mutationKeys'

export function useBoardPositionsBusy() {
  const pendingRepositionings = useMutationState({
    filters: { mutationKey: applicationMutationKeys.reposition, status: 'pending' },
    select: () => true,
  })

  return pendingRepositionings.length > 0
}
