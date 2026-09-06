import type { ApplicationFormValues } from '@/features/applications/model/types'

export function hasUnsavedApplicationFormChanges(
  currentValues: ApplicationFormValues,
  initialValues: ApplicationFormValues,
): boolean {
  return (
    currentValues.company !== initialValues.company ||
    currentValues.role !== initialValues.role ||
    currentValues.status !== initialValues.status ||
    currentValues.notes !== initialValues.notes ||
    currentValues.jobPostingUrl !== initialValues.jobPostingUrl
  )
}
