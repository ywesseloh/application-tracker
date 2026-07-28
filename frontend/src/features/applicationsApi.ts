import { apiClient } from '../shared/apiClient'
import type { Application } from './types'

export const applicationsQueryKey = ['applications'] as const

export type ApplicationInput = Omit<Application, 'id'>
export type ApplicationPositionPatch = Pick<
  Application,
  'id' | 'status' | 'columnPosition'
>

export function fetchApplications() {
  return apiClient.get<Application[]>('/applications')
}

export function createApplication(application: ApplicationInput) {
  return apiClient.post<void>('/application', application)
}

export function updateApplication(application: Application) {
  return apiClient.put<void>(`/application/${application.id}`, application)
}

export function patchApplication(application: ApplicationPositionPatch) {
  return apiClient.patch<void>(`/application/${application.id}`, {
    status: application.status,
    columnPosition: application.columnPosition,
  })
}

export function patchApplications(applications: ApplicationPositionPatch[]) {
  return Promise.all(applications.map(patchApplication))
}

export function deleteApplication(id: number) {
  return apiClient.delete<void>(`/application/${id}`)
}
