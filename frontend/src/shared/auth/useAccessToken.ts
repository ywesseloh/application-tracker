import { useSyncExternalStore } from 'react'
import { getAccessToken, subscribe } from '@/shared/auth/tokenStore'

export function useAccessToken(): string | null {
  return useSyncExternalStore(subscribe, getAccessToken, () => null)
}
