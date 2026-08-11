import { apiClient } from '@/shared/api/apiClient'
import { clearAccessToken, setAccessToken } from '@/shared/auth/tokenStore'
import type { AccessTokenResponse, UserCredentials } from '@/shared/auth/types'

export async function login(credentials: UserCredentials): Promise<AccessTokenResponse> {
  const response = await apiClient.post<AccessTokenResponse>(
    '/auth/login',
    credentials,
    false,
  )
  setAccessToken(response.jwt)
  return response
}

export async function register(credentials: UserCredentials): Promise<void> {
  await apiClient.post('/register', credentials, false)
}

export async function refresh(): Promise<AccessTokenResponse> {
  try {
    const response = await apiClient.post<AccessTokenResponse>(
      '/auth/refresh',
      undefined,
      false,
    )
    setAccessToken(response.jwt)
    return response
  } catch (error) { 
    clearAccessToken()
    throw error
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', undefined, false)
  } finally {
    clearAccessToken()
  }
}
