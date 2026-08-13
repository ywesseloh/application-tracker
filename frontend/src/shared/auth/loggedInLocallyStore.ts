const LOGGED_IN_LOCALLY_KEY = 'loggedInLocally'

export function isLoggedInLocally(): boolean {
  return localStorage.getItem(LOGGED_IN_LOCALLY_KEY) === 'true'
}

export function setLoggedInLocally(value: boolean): void {
  localStorage.setItem(LOGGED_IN_LOCALLY_KEY, value ? 'true' : 'false')
}
