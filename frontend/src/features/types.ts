export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

export type Application = {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  position: number
}
