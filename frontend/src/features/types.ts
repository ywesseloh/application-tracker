export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

export type Application = {
  id: Number
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
