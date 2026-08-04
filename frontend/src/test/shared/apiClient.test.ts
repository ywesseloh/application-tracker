import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, NetworkError, apiClient } from '@/shared/api/apiClient'

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
  })

  function stubFetch() {
    vi.stubGlobal('fetch', fetchMock)
  }

  it('builds relative paths against the API base URL', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(jsonResponse([]))

    await apiClient.get('/board')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/board',
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

    await expect(apiClient.delete('/application/1')).resolves.toBeUndefined()
  })

  it('returns undefined for 204 responses', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(
      apiClient.post('/application', { company: 'Acme' }),
    ).resolves.toBeUndefined()
  })

  it('sends JSON bodies with Content-Type on mutating requests', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    const body = { company: 'Acme', role: 'Engineer' }
    await apiClient.put('/application/1', body)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/application/1',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(body),
      }),
    )
  })

  it('throws ApiError on non-OK responses', async () => {
    stubFetch()
    fetchMock.mockResolvedValue(
      new Response('not found', { status: 404, statusText: 'Not Found' }),
    )

    const error = await apiClient.get('/application/99').catch((err) => err)

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
})
