import { describe, expect, it } from 'vitest'
import {
  applicationsForStatus,
  moveBetweenColumns,
  reorderWithinColumn,
} from '@/features/applications/model/boardOrdering'
import { makeApplication, makeBoard } from '@/test/fixtures'

describe('applicationsForStatus', () => {
  it('filters and sorts by columnPosition', () => {
    const applications = makeBoard([
      { id: 1, company: 'B', status: 'APPLIED', columnPosition: 1 },
      { id: 2, company: 'A', status: 'APPLIED', columnPosition: 0 },
      { id: 3, company: 'C', status: 'WISHLIST', columnPosition: 0 },
    ])

    expect(
      applicationsForStatus(applications, 'APPLIED').map((app) => app.company),
    ).toEqual(['A', 'B'])
  })
})

describe('moveBetweenColumns', () => {
  it('moves onto another tile and densifies both columns', () => {
    const applications = makeBoard([
      { id: 1, company: 'Keep', status: 'WISHLIST', columnPosition: 0 },
      { id: 2, company: 'Move', status: 'WISHLIST', columnPosition: 1 },
      { id: 3, company: 'Target', status: 'APPLIED', columnPosition: 0 },
      { id: 4, company: 'After', status: 'APPLIED', columnPosition: 1 },
    ])

    const next = moveBetweenColumns(applications, '2', '3')

    expect(applicationsForStatus(next, 'WISHLIST').map((app) => app.company)).toEqual([
      'Keep',
    ])
    expect(applicationsForStatus(next, 'APPLIED').map((app) => app.company)).toEqual([
      'Move',
      'Target',
      'After',
    ])
    expect(applicationsForStatus(next, 'APPLIED').map((app) => app.columnPosition)).toEqual([
      0, 1, 2,
    ])
    expect(next.find((app) => app.id === 2)?.status).toBe('APPLIED')
  })

  it('appends when dropping onto an empty status column', () => {
    const applications = makeBoard([
      { id: 1, company: 'Solo', status: 'WISHLIST', columnPosition: 0 },
    ])

    const next = moveBetweenColumns(applications, '1', 'INTERVIEW')

    expect(applicationsForStatus(next, 'WISHLIST')).toHaveLength(0)
    expect(applicationsForStatus(next, 'INTERVIEW')).toEqual([
      expect.objectContaining({
        id: 1,
        status: 'INTERVIEW',
        columnPosition: 0,
      }),
    ])
  })

  it('is a no-op when active and over are in the same column', () => {
    const applications = makeBoard([
      { id: 1, company: 'A', status: 'WISHLIST', columnPosition: 0 },
      { id: 2, company: 'B', status: 'WISHLIST', columnPosition: 1 },
    ])

    expect(moveBetweenColumns(applications, '1', '2')).toBe(applications)
  })

  it('returns the same list for unknown ids', () => {
    const applications = makeBoard([
      { id: 1, company: 'A', status: 'WISHLIST', columnPosition: 0 },
    ])

    expect(moveBetweenColumns(applications, '99', 'APPLIED')).toBe(applications)
  })
})

describe('reorderWithinColumn', () => {
  it('reorders within a column and densifies positions', () => {
    const applications = makeBoard([
      { id: 1, company: 'A', status: 'WISHLIST', columnPosition: 0 },
      { id: 2, company: 'B', status: 'WISHLIST', columnPosition: 1 },
      { id: 3, company: 'C', status: 'WISHLIST', columnPosition: 2 },
    ])

    const next = reorderWithinColumn(applications, '3', '1')

    expect(applicationsForStatus(next, 'WISHLIST').map((app) => app.company)).toEqual([
      'C',
      'A',
      'B',
    ])
    expect(applicationsForStatus(next, 'WISHLIST').map((app) => app.columnPosition)).toEqual([
      0, 1, 2,
    ])
  })

  it('is a no-op when over is a status id', () => {
    const applications = makeBoard([
      { id: 1, company: 'A', status: 'WISHLIST', columnPosition: 0 },
    ])

    expect(reorderWithinColumn(applications, '1', 'WISHLIST')).toBe(applications)
  })

  it('is a no-op for cross-column overs', () => {
    const applications = makeBoard([
      { id: 1, company: 'A', status: 'WISHLIST', columnPosition: 0 },
      { id: 2, company: 'B', status: 'APPLIED', columnPosition: 0 },
    ])

    expect(reorderWithinColumn(applications, '1', '2')).toBe(applications)
  })

  it('is a no-op when active and over are the same index', () => {
    const applications = [
      makeApplication({ id: 1, company: 'A', status: 'WISHLIST', columnPosition: 0 }),
    ]

    expect(reorderWithinColumn(applications, '1', '1')).toBe(applications)
  })
})
