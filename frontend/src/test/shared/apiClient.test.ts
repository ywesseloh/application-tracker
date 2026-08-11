import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, NetworkError, apiClient } from '@/shared/api/apiClient'
import { clearAccessToken, setAccessToken } from '@/shared/auth/tokenStore'

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('apiClient', () => {
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
    clearAccessToken()
  })

  function stubFetch() {
    vi.stubGlobal('fetch', fetchMock)
  }

  it('prefixes relative paths with /api against the API base URL', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(jsonResponse([]))

    await apiClient.get('/board')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/board',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    )
  })

  it('does not double-prefix paths that already start with /api', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(jsonResponse([]))

    await apiClient.get('/api/board')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/board',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('leaves absolute URLs unchanged', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }))

    await apiClient.get('https://example.com/health')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/health',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('parses JSON response bodies', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(jsonResponse([{ id: 1, company: 'Acme' }]))

    await expect(apiClient.get('/board')).resolves.toEqual([
      { id: 1, company: 'Acme' },
    ])
  })

  it('returns undefined for empty successful bodies', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(new Response('', { status: 200 }))

    await expect(apiClient.delete('/applications/1')).resolves.toBeUndefined()
  })

  it('returns undefined for 204 responses', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(
      apiClient.post('/applications', { company: 'Acme' }),
    ).resolves.toBeUndefined()
  })

  it('sends JSON bodies with Content-Type on mutating requests', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    const body = { company: 'Acme', role: 'Engineer' }
    await apiClient.put('/applications/1', body)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/applications/1',
      expect.objectContaining({
        method: 'PUT',
        credentials: 'include',
        headers: expect.any(Headers),
        body: JSON.stringify(body),
      }),
    )

    const headers = fetchMock.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('attaches Bearer Authorization when an access token is set', async () => {
    stubFetch()
    setAccessToken('access-jwt')
    fetchMock.mockResolvedValue(jsonResponse([]))

    await apiClient.get('/board')

    const headers = fetchMock.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer access-jwt')
  })

  it('does not attach Authorization when no access token is set', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(jsonResponse([]))

    await apiClient.get('/board')

    const headers = fetchMock.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Authorization')).toBeNull()
  })

  it('does not attach Authorization when auth not required', async () => {
    stubFetch()
    setAccessToken('access-jwt')
    fetchMock.mockResolvedValue(jsonResponse({ jwt: 'new' }))

    await apiClient.post('/auth/refresh', undefined, false)

    const headers = fetchMock.mock.calls[0][1]?.headers as Headers
    expect(headers.get('Authorization')).toBeNull()
  })

  it('throws ApiError on non-OK responses', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(
      new Response('not found', { status: 404, statusText: 'Not Found' }),
    )

    const error = await apiClient.get('/applications/99').catch((err) => err)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      name: 'ApiError',
      status: 404,
      body: 'not found',
      message: 'Request failed with status 404',
    })
  })

  it('throws NetworkError when fetch fails', async () => {
    stubFetch()
    const cause = new TypeError('Failed to fetch')
    fetchMock.mockRejectedValue(cause)

    const error = await apiClient.get('/board').catch((err) => err)

    expect(error).toBeInstanceOf(NetworkError)
    expect(error).toMatchObject({
      name: 'NetworkError',
      message: 'Unable to reach the server',
      cause,
    })
  })

  it('throws NetworkError when the request is aborted', async () => {
    stubFetch()
    fetchMock.mockRejectedValue(new DOMException('Aborted', 'AbortError'))

    await expect(apiClient.get('/board')).rejects.toBeInstanceOf(NetworkError)
  })

  it('refreshes once and retries the original request after a 401', async () => {
    stubFetch()
    setAccessToken('expired-jwt')

    fetchMock
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ jwt: 'fresh-jwt' }))
      .mockResolvedValueOnce(jsonResponse([{ id: 1 }]))

    await expect(apiClient.get('/board')).resolves.toEqual([{ id: 1 }])

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8080/api/board')
    expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:8080/api/auth/refresh')
    expect(fetchMock.mock.calls[2][0]).toBe('http://localhost:8080/api/board')

    const retryHeaders = fetchMock.mock.calls[2][1]?.headers as Headers
    expect(retryHeaders.get('Authorization')).toBe('Bearer fresh-jwt')
  })

  it('shares a single refresh across concurrent 401 responses', async () => {
    stubFetch()
    setAccessToken('expired-jwt')

    let refreshCalls = 0
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/board')) {
        if (refreshCalls === 0) {
          return new Response('unauthorized', { status: 401 })
        }
        return jsonResponse([])
      }
      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1
        await new Promise((resolve) => setTimeout(resolve, 20))
        return jsonResponse({ jwt: 'fresh-jwt' })
      }
      throw new Error(`Unexpected URL: ${url}`)
    })

    await Promise.all([apiClient.get('/board'), apiClient.get('/board')])

    expect(refreshCalls).toBe(1)
  })

  it('clears the access token and throws when refresh fails after a 401', async () => {
    stubFetch()
    setAccessToken('expired-jwt')

    fetchMock
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('bad refresh', { status: 401 }))

    const error = await apiClient.get('/board').catch((err) => err)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 401, body: 'bad refresh' })
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const { getAccessToken } = await import('@/shared/auth/tokenStore')
    expect(getAccessToken()).toBeNull()
  })
})
