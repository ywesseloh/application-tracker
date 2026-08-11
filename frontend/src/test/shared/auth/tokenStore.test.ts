import { afterEach, describe, expect, it } from 'vitest'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
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
})
