import { describe, expect, it, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { useDeleteAccount } from '@/shared/hooks/useDeleteAccount'
import {
  createTestQueryClient,
  renderHookWithProviders,
} from '@/test/renderWithProviders'

const deleteUser = vi.fn()
const logout = vi.fn()

vi.mock('@/shared/api/userApi', () => ({
  deleteUser: (...args: unknown[]) => deleteUser(...args),
}))

vi.mock('@/shared/api/authApi', () => ({
  logout: (...args: unknown[]) => logout(...args),
}))

describe('useDeleteAccount', () => {
  beforeEach(() => {
    deleteUser.mockReset()
    logout.mockReset()
    deleteUser.mockResolvedValue(undefined)
  })

  it('calls deleteUser then logs out and clears the query cache on success', async () => {
    const queryClient = createTestQueryClient()
    const clearSpy = vi.spyOn(queryClient, 'clear')

    const { result } = renderHookWithProviders(() => useDeleteAccount(), {
      queryClient,
    })

    result.current.deleteAccountMutation.mutate()

    await waitFor(() => expect(deleteUser).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1))
    expect(clearSpy).toHaveBeenCalledTimes(1)
    expect(result.current.error).toBeNull()
  })

  it('keeps the session when deleteUser fails', async () => {
    deleteUser.mockRejectedValueOnce(new Error('Delete failed'))
    const queryClient = createTestQueryClient()
    const clearSpy = vi.spyOn(queryClient, 'clear')

    const { result } = renderHookWithProviders(() => useDeleteAccount(), {
      queryClient,
    })

    result.current.deleteAccountMutation.mutate()

    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(logout).not.toHaveBeenCalled()
    expect(clearSpy).not.toHaveBeenCalled()
    expect(result.current.error?.message).toBe('Delete failed')
  })
})
