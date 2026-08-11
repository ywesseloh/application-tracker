import { afterEach, describe, expect, it, vi } from 'vitest'
import { login, logout, refresh, register } from '@/shared/auth/authApi'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/shared/auth/tokenStore'

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('authApi', () => {
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
    clearAccessToken()
  })

  function stubFetch() {
    vi.stubGlobal('fetch', fetchMock)
  }

  it('login stores the access token from the response', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(jsonResponse({ jwt: 'login-jwt' }))

    await expect(
      login({ username: 'mock-user', password: 'password' }),
    ).resolves.toEqual({ jwt: 'login-jwt' })

    expect(getAccessToken()).toBe('login-jwt')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ username: 'mock-user', password: 'password' }),
      }),
    )
  })

  it('register posts credentials without storing a token', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(new Response('', { status: 200 }))

    await register({ username: 'newuser', password: 'secret' })

    expect(getAccessToken()).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/register',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ username: 'newuser', password: 'secret' }),
      }),
    )
  })

  it('refresh stores the rotated access token and omits Authorization', async () => {
    stubFetch()
    setAccessToken('old-jwt')
    fetchMock.mockResolvedValue(jsonResponse({ jwt: 'rotated-jwt' }))

    await expect(refresh()).resolves.toEqual({ jwt: 'rotated-jwt' })

    expect(getAccessToken()).toBe('rotated-jwt')
    const headers = fetchMock.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Authorization')).toBeNull()
  })

  it('refresh clears the accesstoken on error', async () => {
    stubFetch()
    setAccessToken('login-jwt')
    fetchMock.mockResolvedValue(new Response('unauthorized', { status: 401 }))

    await expect(refresh()).rejects.toMatchObject({ status: 401 })
    expect(getAccessToken()).toBeNull()
  })

  it('logout clears the access token even when the request fails', async () => {
    stubFetch()
    setAccessToken('login-jwt')
    fetchMock.mockResolvedValue(new Response('gone', { status: 401 }))

    await expect(logout()).rejects.toMatchObject({ status: 401 })
    expect(getAccessToken()).toBeNull()
  })

  it('logout clears the access token on success', async () => {
    stubFetch()
    setAccessToken('login-jwt')
    fetchMock.mockResolvedValue(new Response('', { status: 200 }))

    await logout()

    expect(getAccessToken()).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    )
  })
})
