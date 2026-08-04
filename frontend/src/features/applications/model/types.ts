export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

export type Application = {
  id: number
  company: string
  role: string
  status: ApplicationStatus
  columnPosition: number
  notes: string | null
  jobPostingUrl: string | null
}

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
