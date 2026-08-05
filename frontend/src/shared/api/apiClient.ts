const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const REQUEST_TIMEOUT_MS = 8_000

type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly body: string

  constructor(status: number, body: string) {
    super(`Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
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
  return `${base}${normalizedPath}`
}

function withTimeout(signal?: AbortSignal | null): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, signal, ...init } = options
  const hasBody = body !== undefined

  let response: Response
  try {
    response = await fetch(resolveUrl(path), {
      ...init,
      method,
      signal: withTimeout(signal),
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: hasBody ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    throw new NetworkError(cause)
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
  get<T>(path: string, options?: RequestOptions) {
    return request<T>('GET', path, options)
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('POST', path, { ...options, body })
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PUT', path, { ...options, body })
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PATCH', path, { ...options, body })
  },

  delete<T>(path: string, options?: RequestOptions) {
    return request<T>('DELETE', path, options)
  },
}
