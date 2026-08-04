import type { Application } from '@/features/applications/model/types'

type ApplicationOverrides = Partial<Application>

export function makeApplication(
  overrides: ApplicationOverrides = {},
): Application {
  return {
    id: 1,
    company: 'Acme',
    role: 'Engineer',
    status: 'WISHLIST',
    columnPosition: 0,
    notes: null,
    jobPostingUrl: null,
    ...overrides,
  }
}

export function makeBoard(apps: ApplicationOverrides[]): Application[] {
  return apps.map((overrides, index) =>
    makeApplication({
      id: index + 1,
      columnPosition: overrides.columnPosition ?? 0,
      ...overrides,
    }),
  )
}
