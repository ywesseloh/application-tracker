# Frontend

React SPA for the [Application Tracker](../README.md). Auth screen, kanban board with drag-and-drop, application forms, and detail views backed by the Spring Boot API.

For module layout, auth session flow, data flow, and optimistic DnD, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Stack

- React 19, TypeScript, Vite
- TanStack Query
- @dnd-kit (drag and drop)
- Vitest + Testing Library
- Oxlint
- nginx (production Docker image)

## Prerequisites

- Node.js 22+
- Backend API running at http://localhost:8080 (or set `VITE_API_BASE_URL`)

## Run

```bash
npm install
npm run dev
```

Dev server: http://localhost:5173

Create an account or sign in on the auth screen, then use the board.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck and production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | Oxlint |

## API base URL

The client reads `VITE_API_BASE_URL` at build/dev time (see `src/shared/api/apiClient.ts`).

```bash
# optional override
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

Default fallback: `http://localhost:8080`.

In Docker Compose this is passed as a build arg so the browser still calls the host-mapped backend (`localhost:8080`), not the Compose service name `backend`.

Auth uses an HttpOnly refresh cookie, so the API client always sends `credentials: 'include'`. Backend CORS must allow the SPA origin (see backend docs).

## Docker

Built from the repo root Compose file (`../docker-compose.yml`) or alone:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  -t application-tracker-frontend .
docker run --rm -p 5173:80 application-tracker-frontend
```

The image builds the SPA, then serves it with nginx (`nginx.conf` handles client-side routing).

## Project layout

```
src/
├── app/                     # providers, App auth gate
├── features/
│   ├── applications/        # Board, tiles, forms, detail, hooks, cache/ordering
│   └── auth/                # AuthScreen (login / register)
├── shared/
│   ├── api/                 # apiClient, authApi, userApi, applicationsApi, getErrorMessage
│   ├── auth/                # tokenStore, loggedInLocallyStore, useAccessToken
│   └── components/          # ActionErrorBanner
└── test/                    # Vitest setup and unit tests
```

Path alias: `@/` → `src/`.

## Auth flow
- [`App.tsx`](src/app/App.tsx) bootstraps the session and toggles between auth screen and application board based on login state.
- `AuthScreen` handles login and register.
- Access JWT lives in memory; refresh token cookie is managed by the browser for `/api/auth/*`.
- Expired JWT triggers token refresh; If refresh token is expired the user is logged out
- Logging out from the user side clears local session immediately and posts logout in the background.
## Tests

```bash
npm test
```

Focus areas: API client, auth stores/`authApi`, board ordering helpers, applications cache, and mutation hooks (`src/test/shared/auth/*`, `src/test/shared/apiClient.test.ts`).
