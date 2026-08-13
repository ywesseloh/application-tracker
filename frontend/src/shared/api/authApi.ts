import { apiClient } from '@/shared/api/apiClient'
import { setLoggedInLocally } from '@/shared/auth/loggedInLocallyStore'
import { clearAccessToken, setAccessToken } from '@/shared/auth/tokenStore'
import type { AccessTokenResponse, UserCredentials } from '@/shared/api/types'

export async function login(credentials: UserCredentials): Promise<AccessTokenResponse> {
  const response = await apiClient.post<AccessTokenResponse>(
    '/auth/login',
    credentials,
    false,
  )
  setAccessToken(response.jwt)
  setLoggedInLocally(true)
  return response
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
    setLoggedInLocally(false)
    throw error
  }
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', undefined, false)
  } finally {
    clearAccessToken()
    setLoggedInLocally(false)
  }
}
