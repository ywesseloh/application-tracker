import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  subscribe,
} from '@/shared/auth/tokenStore'

describe('tokenStore', () => {
  afterEach(() => {
    clearAccessToken()
  })

  it('starts with no access token', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('stores and clears the access token in memory', () => {
    setAccessToken('jwt-1')
    expect(getAccessToken()).toBe('jwt-1')

    setAccessToken('jwt-2')
    expect(getAccessToken()).toBe('jwt-2')

    clearAccessToken()
    expect(getAccessToken()).toBeNull()
  })

  it('notifies subscribers when the token changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    setAccessToken('jwt-1')
    clearAccessToken()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    setAccessToken('jwt-2')
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
