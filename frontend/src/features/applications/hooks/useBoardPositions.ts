import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patchApplications } from '@/shared/api/applicationsApi'
import {
  applicationMutationKeys,
  boardPositionsScope,
} from '@/features/applications/model/mutationKeys'
import { invalidateApplications } from '@/features/applications/model/applicationsCache'

export function useBoardPositions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: applicationMutationKeys.reposition,
    scope: boardPositionsScope,
    mutationFn: patchApplications,
    onSettled: () => invalidateApplications(queryClient),
  })
}
