import { useMutation, useQueryClient } from '@tanstack/react-query'
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
