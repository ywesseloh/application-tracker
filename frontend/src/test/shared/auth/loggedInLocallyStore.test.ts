import { afterEach, describe, expect, it } from 'vitest'
import {
  isLoggedInLocally,
  setLoggedInLocally,
} from '@/shared/auth/loggedInLocallyStore'

describe('loggedInLocallyStore', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('returns false when the key is missing', () => {
    expect(isLoggedInLocally()).toBe(false)
  })

  it('persists true and false values', () => {
    setLoggedInLocally(true)
    expect(isLoggedInLocally()).toBe(true)
    expect(localStorage.getItem('loggedInLocally')).toBe('true')

    setLoggedInLocally(false)
    expect(isLoggedInLocally()).toBe(false)
    expect(localStorage.getItem('loggedInLocally')).toBe('false')
  })
})
