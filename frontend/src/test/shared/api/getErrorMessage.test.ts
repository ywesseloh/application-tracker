import { describe, expect, it } from 'vitest'
import { ApiError, NetworkError } from '@/shared/api/apiClient'
import { getErrorMessage } from '@/shared/api/getErrorMessage'

describe('getErrorMessage', () => {
  it('returns Error.message for Error instances', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom')
  })

  it('returns NetworkError.message', () => {
    expect(getErrorMessage(new NetworkError())).toBe('Unable to reach the server')
  })

  it('returns ApiError.message from a JSON error body', () => {
    const error = new ApiError(
      401,
      JSON.stringify({
        errorType: 'AUTHENTICATION_FAILED',
        errorMessage: 'Invalid credentials',
      }),
    )

    expect(getErrorMessage(error)).toBe('Invalid credentials')
  })

  it('stringifies non-Error values', () => {
    expect(getErrorMessage('plain string')).toBe('plain string')
    expect(getErrorMessage(42)).toBe('42')
    expect(getErrorMessage(null)).toBe('null')
    expect(getErrorMessage(undefined)).toBe('undefined')
  })
})
