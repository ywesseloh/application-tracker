import { getAccessToken } from '@/shared/auth/tokenStore'
import type { ApiErrorType, ErrorResponse } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const API_PREFIX = '/api'
const REQUEST_TIMEOUT_MS = 8_000

export type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: unknown
  skipAuthRefresh?: boolean
  authRequired?: boolean
}

export class ApiError extends Error {
  readonly status: number
  readonly type: ApiErrorType
  readonly message: string

  constructor(status: number, body: string) {
    super(`Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status

    try {
      const errorResponse: ErrorResponse = JSON.parse(body)
      this.type = errorResponse.errorType
      this.message = errorResponse.errorMessage
    } catch {
      this.type = 'GENERIC_ERROR'
      this.message = 'Something went wrong. Please try again.'
    }
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('Unable to reach the server')
    this.name = 'NetworkError'
    this.cause = cause
  }
}

function resolveUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const base = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const prefixedPath = normalizedPath.startsWith(`${API_PREFIX}/`) || normalizedPath === API_PREFIX
    ? normalizedPath
    : `${API_PREFIX}${normalizedPath}`
  return `${base}${prefixedPath}`
}

function withTimeout(signal?: AbortSignal | null): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal
}

function buildHeaders(authRequired: boolean, hasBody: boolean, headers?: HeadersInit): Headers {
  const result = new Headers(headers)

  if (hasBody && !result.has('Content-Type')) {
    result.set('Content-Type', 'application/json')
  }

  if (authRequired && !result.has('Authorization')) {
    const token = getAccessToken()
    if (token) {
      result.set('Authorization', `Bearer ${token}`)
    }
  }

  return result
}

let refreshInFlight: Promise<void> | null = null

async function refreshAccessTokenSingleFlight(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
        const { refresh } = await import('@/shared/api/authApi')
        await refresh()
    })().finally(() => {
      refreshInFlight = null
    })
  }

  return refreshInFlight
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, signal, skipAuthRefresh = false, authRequired = true, ...init } = options
  const hasBody = body !== undefined

  let response: Response
  try {
    response = await fetch(resolveUrl(path), {
      ...init,
      method,
      credentials: 'include',
      signal: withTimeout(signal),
      headers: buildHeaders(authRequired, hasBody, headers),
      body: hasBody ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    throw new NetworkError(cause)
  }

  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    authRequired
  ) {
    await refreshAccessTokenSingleFlight()
    return request<T>(method, path, { ...options, skipAuthRefresh: true })
  }

  if (!response.ok) {
    const errorBody = await response.text()
    throw new ApiError(response.status, errorBody)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export const apiClient = {
  get<T>(path: string, authRequired = true, options?: RequestOptions) {
    return request<T>('GET', path, { ...options, authRequired })
  },

  post<T>(path: string, body?: unknown, authRequired = true, options?: RequestOptions) {
    return request<T>('POST', path, { ...options, body, authRequired })
  },

  put<T>(path: string, body?: unknown, authRequired = true, options?: RequestOptions) {
    return request<T>('PUT', path, { ...options, body, authRequired })
  },

  patch<T>(path: string, body?: unknown, authRequired = true, options?: RequestOptions) {
    return request<T>('PATCH', path, { ...options, body, authRequired })
  },

  delete<T>(path: string, authRequired = true, options?: RequestOptions) {
    return request<T>('DELETE', path, { ...options, authRequired })
  },
}
