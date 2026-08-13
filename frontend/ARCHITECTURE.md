# Frontend architecture

React SPA for the kanban board. Feature modules own UI and domain helpers; the shared layer provides the HTTP client, auth session stores, and a reusable error banner.

There is **no client-side router** — create/edit/detail are overlays driven by local state on the board. Auth gating lives in `App.tsx`.

## High-level structure

```
src/
├── app/                         # bootstrap + auth gate
│   ├── main.tsx                 # createRoot → providers → App
│   ├── providers.tsx            # QueryClient defaults
│   └── App.tsx                  # refresh bootstrap → AuthScreen | ApplicationBoard
├── features/
│   ├── applications/            # board feature
│   └── auth/                    # AuthScreen (login / register)
├── shared/
│   ├── api/                     # apiClient, applicationsApi, authApi, userApi, getErrorMessage, types
│   ├── auth/                    # tokenStore, loggedInLocallyStore, useAccessToken
│   └── components/              # ActionErrorBanner
└── test/                        # Vitest setup, fixtures, specs
```

Path alias: `@/` → `src/` (`vite.config.ts`).

## Feature module

```
features/applications/
├── components/
│   ├── ApplicationBoard/        # orchestration + DnD + logout
│   ├── ApplicationTile/         # sortable card
│   ├── ApplicationDetail/       # detail modal
│   └── ApplicationForm/         # create / edit
├── hooks/                       # query, mutations, busy, errors
├── model/                       # types, ordering, cache, mutation keys
└── index.ts                     # exports ApplicationBoard
```

Board local state:

- `selectedId` → detail overlay
- `formMode` (`closed` | create+status | edit+id) → form overlay
- DnD: `activeId`, drag snapshot, suppress-open-after-drag

Column order matches the backend enum: `WISHLIST` → `APPLIED` → `INTERVIEW` → `OFFER` → `REJECTED` (`STATUSES` in `boardOrdering.ts`).

## Data flow

```
GET /board
  → applicationsApi.fetchApplications
  → React Query key ['applications']
  → ApplicationBoard (applicationsForStatus per column)
  → user actions (DnD / forms / detail)
  → mutations
  → onSettled: invalidate → refetch
```

Query defaults (`providers.tsx`):

- `staleTime` 5 minutes
- Retry only on `NetworkError` (mutations do not retry)
- Refetch on window focus

All board-related mutations share `boardWritesScope` so writes serialize and the UI can treat “board busy” as a single flag.

## Optimistic drag-and-drop

DnD uses `@dnd-kit` (`DndContext`, sortable columns/tiles, `DragOverlay`).

1. **Drag start** — snapshot current state
2. **Drag over** — live cross-column moves, update datasource locally
3. **Drag end** — if status or position changed vs snapshot → `PATCH /board/move/:id`
4. **Success**  — reload board; **Error** — restore snapshot;

Droppable ids: column id = status string; tile id = application id string.

Create / update / delete are **not** optimistic: call the API, then invalidate the board query.

Pure ordering helpers live in `model/boardOrdering.ts` (`moveBetweenColumns`, `reorderWithinColumn`, densified positions). Cache helpers live in `model/applicationsCache.ts` (snapshot / restore / apply / invalidate).

## API client

`shared/api/apiClient.ts`:

- Base URL: `import.meta.env.VITE_API_BASE_URL` ?? `http://localhost:8080`
- Relative paths are prefixed with `/api` (e.g. `/board` → `http://localhost:8080/api/board`)
- JSON helpers + 8s timeout; always sends `credentials: 'include'`
- Attaches `Authorization: Bearer <jwt>` from the in-memory token store when `authRequired` (default true)
- On **401** from secured endpoints: single-flight `POST /auth/refresh`, then retry once; refresh failure clears the token and sets `loggedInLocally` to `false`
- `ApiError` (HTTP failure) and `NetworkError` (unreachable)

`shared/api/applicationsApi.ts` wraps board and application endpoints used by the hooks.

`shared/api/getErrorMessage.ts` maps thrown values to a display string (`Error.message`, else `String(error)`).

## Auth

### Session stores (`shared/auth/`)

| Module | Role |
|--------|------|
| `tokenStore` | In-memory access JWT with `subscribe` for React; not persisted |
| `loggedInLocallyStore` | Persisted `loggedInLocally` flag in localStorage; gates bootstrap refresh |
| `useAccessToken` | `useSyncExternalStore` over the token store |

### Auth APIs (`shared/api/`)

| Module | Role |
|--------|------|
| `authApi` | `login` / `refresh` / `logout` (`/api/auth/*`) |
| `userApi` | `register` / `deleteUser` (`/api/user`) — delete is API-only (no UI yet) |

### UI and bootstrap

`features/auth` — `AuthScreen` (login default, switch to register). Submit calls `login`, or `register` then `login`. Client max-length validation (20) on register only; backend also enforces password min length. Failed login/register shows `ActionErrorBanner` via `getErrorMessage`. Submit button shows a spinner while the request is in flight.

[`App.tsx`](src/app/App.tsx) gates the app:

1. Show bootstrap **Loading…**
2. If `loggedInLocally` is true, call `refresh()` to restore the session from the HttpOnly cookie; otherwise skip refresh
3. Then `AuthScreen` if no access token, else `ApplicationBoard`

`loggedInLocally` lifecycle: set `true` on successful `login` (Sign in or post-register); set `false` on `logout` or when `refresh` fails (expired/revoked refresh token).

`logout` clears the access token and `loggedInLocally` immediately, then posts `/api/auth/logout` in the background (best-effort). The board **Log out** button also calls `queryClient.clear()` so cached applications data cannot leak into the next session.

Refresh cookie path `/api/auth`; access JWT in memory + Bearer header. `apiClient` sends `credentials: 'include'` and retries once after 401 via refresh.

## Busy and error UX

| Concern | Behavior |
|---------|----------|
| App bootstrap | “Loading…” until refresh attempt finishes (or is skipped) |
| Auth submit | Spinner + “Signing in…” / “Creating account…”; submit disabled when empty/invalid/in flight |
| Auth API errors | `ActionErrorBanner` above submit; clears on edit / mode switch / dismiss |
| Initial board load | Spinner until first successful board fetch |
| Load failure | Full-page alert + Retry |
| Mutation errors | `ActionErrorBanner` (board / form / detail) with dismiss |
| Tile syncing | Spinner, `aria-busy`, sortable disabled |
| Board writes pending | New drags blocked; tiles disabled |

Hooks: `useBoardWritesBusy`, `useApplicationBusy`, `useApplicationActionError`.

## Tests

Vitest + jsdom (`src/test/`):

| Area | Focus |
|------|--------|
| `shared/apiClient.test.ts` | URL building, JSON, credentials, Bearer, 401 refresh retry |
| `shared/auth/*` | tokenStore, loggedInLocallyStore, authApi login/refresh/logout |
| `model/boardOrdering.test.ts` | Filter/sort, move, reorder, densify |
| `model/applicationsCache.test.ts` | Snapshot / restore / apply |
| `hooks/useApplicationMutations.test.tsx` | Invalidation after mutations |

No full-board component E2E suite yet — coverage targets ordering, cache, auth, and API glue.
