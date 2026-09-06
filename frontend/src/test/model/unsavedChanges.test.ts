import { describe, expect, it } from 'vitest'
import { hasUnsavedApplicationFormChanges } from '@/features/applications/model/unsavedChanges'
import type { ApplicationFormValues } from '@/features/applications/model/types'

const initialValues: ApplicationFormValues = {
  company: 'Acme',
  role: 'Engineer',
  status: 'WISHLIST',
  notes: 'Initial notes',
  jobPostingUrl: 'https://example.com/job',
}

describe('hasUnsavedApplicationFormChanges', () => {
  it('returns false for unchanged values', () => {
    expect(hasUnsavedApplicationFormChanges(initialValues, initialValues)).toBe(false)
  })

  it.each([
    ['company', { company: 'Changed Co' }],
    ['role', { role: 'Changed role' }],
    ['status', { status: 'APPLIED' }],
    ['notes', { notes: 'Changed notes' }],
    ['jobPostingUrl', { jobPostingUrl: 'https://example.com/changed' }],
  ] as const)('returns true when %s changes', (_, change) => {
    expect(
      hasUnsavedApplicationFormChanges(
        { ...initialValues, ...change },
        initialValues,
      ),
    ).toBe(true)
  })

  it('returns false when a changed value is restored', () => {
    const changedValues = { ...initialValues, notes: 'Changed notes' }

    expect(
      hasUnsavedApplicationFormChanges(
        { ...changedValues, notes: initialValues.notes },
        initialValues,
      ),
    ).toBe(false)
  })
})
