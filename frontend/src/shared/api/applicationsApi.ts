import { apiClient } from '@/shared/api/apiClient'
import type { Application } from '@/features/applications/model/types'

export const applicationsQueryKey = ['applications'] as const

export type ApplicationInput = Omit<Application, 'id' | 'columnPosition'>
export type ApplicationPositionPatch = Pick<
  Application,
  'id' | 'status' | 'columnPosition'
>

export function fetchApplications() {
  return apiClient.get<Application[]>('/board')
}

export function createApplication(application: ApplicationInput) {
  return apiClient.post<void>('/application', application)
}

export function updateApplication(application: ApplicationInput, id: number) {
  return apiClient.put<void>(`/application/${id}`, application)
}

export function moveApplication(patch: ApplicationPositionPatch, id: number) {
  return apiClient.patch<void>(`/board/move/${id}`, patch)
}

export function deleteApplication(id: number) {
  return apiClient.delete<void>(`/application/${id}`)
}
