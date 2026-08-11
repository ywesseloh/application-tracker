import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/apiClient'
import type { Application, ApplicationInput, ApplicationPositionPatch } from '@/shared/api/types'

export const applicationsQueryKey = ['applications'] as const

export function fetchApplications() {
  return apiClient.get<Application[]>('/board')
}

export const applicationsQueryOptions = queryOptions({
  queryKey: applicationsQueryKey,
  queryFn: () => fetchApplications(),
})

export function createApplication(application: ApplicationInput) {
  return apiClient.post<void>('/applications', application)
}

export function updateApplication(application: ApplicationInput, id: number) {
  return apiClient.put<void>(`/applications/${id}`, application)
}

export function moveApplication(patch: ApplicationPositionPatch, id: number) {
  return apiClient.patch<void>(`/board/move/${id}`, patch)
}

export function deleteApplication(id: number) {
  return apiClient.delete<void>(`/applications/${id}`)
}
