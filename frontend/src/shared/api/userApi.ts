import { apiClient } from '@/shared/api/apiClient'
import type { User, UserCredentials } from '@/shared/api/types'

export const userQueryKey = ['user'] as const

export async function register(credentials: UserCredentials): Promise<void> {
  await apiClient.post('/user', credentials, false)
}

export async function getUser() { 
  return apiClient.get<User>('/user')
}

export async function deleteUser(): Promise<void> {
  await apiClient.delete('/user')
}