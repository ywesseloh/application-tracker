const API_BASE_URL = 'http://localhost:8080'

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

function resolveUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const base = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...init } = options
  const hasBody = body !== undefined

  const response = await fetch(resolveUrl(path), {
    ...init,
    method,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  })

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
