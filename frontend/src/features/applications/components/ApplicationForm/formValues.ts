import type { ApplicationStatus } from '@/shared/api/types'

export type ApplicationFormValues = {
  company: string
  role: string
  status: ApplicationStatus
  notes: string
  jobPostingUrl: string
}

export const EMPTY_VALUES: ApplicationFormValues = {
  company: '',
  role: '',
  status: 'WISHLIST',
  notes: '',
  jobPostingUrl: '',
}