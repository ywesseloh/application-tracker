import type { ApplicationStatus } from '@/shared/api/types'

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
}

export type FormMode =
  | { type: 'closed' }
  | { type: 'create'; status: ApplicationStatus }
  | { type: 'edit'; id: number }
