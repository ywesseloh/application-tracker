import { describe, expect, it, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { useApplicationsQuery } from '@/features/applications/hooks/useApplicationsQuery'
import {
  useCreateApplication,
  useMoveApplication,
} from '@/features/applications/hooks/useApplicationMutations'
import { makeBoard } from '@/test/fixtures'
import {
  createTestQueryClient,
  renderHookWithProviders,
} from '@/test/renderWithProviders'

const createApplication = vi.fn()
const moveApplication = vi.fn()
const fetchApplications = vi.fn()

vi.mock('@/shared/api/applicationsApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api/applicationsApi')>()
  return {
    ...actual,
    createApplication: (...args: unknown[]) => createApplication(...args),
    moveApplication: (...args: unknown[]) => moveApplication(...args),
    fetchApplications: (...args: unknown[]) => fetchApplications(...args),
  }
})

describe('useApplicationMutations cache invalidation', () => {
  beforeEach(() => {
    createApplication.mockReset()
    moveApplication.mockReset()
    fetchApplications.mockReset()
    createApplication.mockResolvedValue(undefined)
    moveApplication.mockResolvedValue(undefined)
    fetchApplications.mockResolvedValue(makeBoard([{ id: 1, company: 'Acme' }]))
  })

  it('refetches the board after create settles when idle', async () => {
    const queryClient = createTestQueryClient()

    renderHookWithProviders(() => useApplicationsQuery(), { queryClient })
    await waitFor(() => expect(fetchApplications).toHaveBeenCalledTimes(1))

    const { result } = renderHookWithProviders(() => useCreateApplication(), {
      queryClient,
    })

    result.current.createMutation.mutate({
      company: 'New Co',
      role: 'Dev',
      status: 'WISHLIST',
      notes: null,
      jobPostingUrl: null,
    })

    await waitFor(() => expect(createApplication).toHaveBeenCalled())
    await waitFor(() => expect(fetchApplications).toHaveBeenCalledTimes(2))
  })

  it('refetches the board after move settles when idle', async () => {
    const queryClient = createTestQueryClient()

    renderHookWithProviders(() => useApplicationsQuery(), { queryClient })
    await waitFor(() => expect(fetchApplications).toHaveBeenCalledTimes(1))

    const { result } = renderHookWithProviders(() => useMoveApplication(), {
      queryClient,
    })

    result.current.moveMutation.mutate({
      id: 1,
      status: 'APPLIED',
      columnPosition: 0,
    })

    await waitFor(() => expect(moveApplication).toHaveBeenCalled())
    await waitFor(() => expect(fetchApplications).toHaveBeenCalledTimes(2))
  })
})
