import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { applicationsQueryKey } from '@/shared/api/applicationsApi'
import { applicationMutationKeys } from '@/features/applications/model/mutationKeys'
import {
  applyLocalChange,
  clearSettledMutations,
  restoreApplications,
  snapshotApplications,
} from '@/features/applications/model/applicationsCache'
import { makeApplication, makeBoard } from '@/test/fixtures'

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

describe('applyLocalChange', () => {
  it('updates cached applications', () => {
    const queryClient = createClient()
    queryClient.setQueryData(applicationsQueryKey, makeBoard([{ id: 1, company: 'Acme' }]))

    const next = applyLocalChange(queryClient, (apps) =>
      apps.map((app) => ({ ...app, company: 'Beta' })),
    )

    expect(next[0]?.company).toBe('Beta')
    expect(queryClient.getQueryData(applicationsQueryKey)).toEqual(next)
  })

  it('starts from an empty list when the cache is empty', () => {
    const queryClient = createClient()

    const next = applyLocalChange(queryClient, (apps) => [
      ...apps,
      makeApplication({ id: 1, company: 'New' }),
    ])

    expect(next).toHaveLength(1)
    expect(queryClient.getQueryData(applicationsQueryKey)).toEqual(next)
  })
})

describe('snapshotApplications / restoreApplications', () => {
  it('snapshots a shallow copy and restore replaces cache', () => {
    const queryClient = createClient()
    const original = makeBoard([{ id: 1, company: 'Acme' }])
    queryClient.setQueryData(applicationsQueryKey, original)

    const snapshot = snapshotApplications(queryClient)
    expect(snapshot).toEqual(original)
    expect(snapshot).not.toBe(original)
    expect(snapshot[0]).not.toBe(original[0])

    const restored = makeBoard([{ id: 2, company: 'Other' }])
    restoreApplications(queryClient, restored)
    expect(queryClient.getQueryData(applicationsQueryKey)).toEqual(restored)
  })
})

describe('clearSettledMutations', () => {
  it('removes settled mutations and keeps pending ones', async () => {
    const queryClient = createClient()
    let resolvePending!: () => void
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePending = resolve
    })

    const pending = queryClient.getMutationCache().build(queryClient, {
      mutationKey: applicationMutationKeys.create,
      mutationFn: () => pendingPromise,
    })
    const settled = queryClient.getMutationCache().build(queryClient, {
      mutationKey: applicationMutationKeys.create,
      mutationFn: async () => undefined,
    })

    void pending.execute(undefined)
    await settled.execute(undefined)

    clearSettledMutations(queryClient, applicationMutationKeys.create)

    const remaining = queryClient
      .getMutationCache()
      .findAll({ mutationKey: applicationMutationKeys.create })

    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.state.status).toBe('pending')

    resolvePending()
    await pendingPromise
  })
})