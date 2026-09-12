//////////////////////////
// Request object types //
//////////////////////////

export type UserCredentials = {
  username: string
  password: string
}

export type ApplicationInput = Omit<Application, 'id' | 'columnPosition'>
export type ApplicationPositionPatch = Pick<
  Application,
  'id' | 'status' | 'columnPosition'
>

///////////////////////////
// Response object types //
///////////////////////////

export type AccessTokenResponse = {
  jwt: string
}

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

export type ApiErrorType =
  | 'AUTHENTICATION_FAILED'
  | 'BAD_REFRESH_TOKEN'
  | 'GENERIC_ERROR'
  | 'ILLEGAL_COLUMN_POSITION'
  | 'INVALID_REQUEST_BODY'
  | 'RESOURCE_NOT_FOUND'
  | 'USERNAME_ALREADY_EXISTS'

export type ErrorResponse = {
  errorType: ApiErrorType
  errorMessage: string
}

export type User = {
  id: number
  username: string
  createdAt: string
  updatedAt: string
}
