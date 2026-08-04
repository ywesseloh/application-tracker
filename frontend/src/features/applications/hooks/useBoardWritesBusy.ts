import { useMutationState } from '@tanstack/react-query'
import { applicationMutationKeys } from '@/features/applications/model/mutationKeys'

/** True while any create / update / delete / move mutation is in flight or queued. */
export function useBoardWritesBusy() {
  const pending = useMutationState({
    filters: { mutationKey: applicationMutationKeys.all, status: 'pending' },
    select: () => true,
  })

  return pending.length > 0
}
