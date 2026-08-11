import { apiClient } from '@/shared/api/apiClient'
import type { UserCredentials } from '@/shared/api/types'

export async function register(credentials: UserCredentials): Promise<void> {
  await apiClient.post('/user', credentials, false)
}

export async function deleteUser(): Promise<void> {
  await apiClient.delete('/user')
}