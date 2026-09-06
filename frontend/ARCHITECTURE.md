# Frontend Architecture

The frontend is a React SPA for authentication, the kanban board, application forms, detail views, and public legal pages. Feature modules own UI and domain helpers; shared modules provide API, auth, modal, and error primitives.

## Application Structure

```text
src/
├── app/          bootstrap, providers, App shell, code-based router
├── features/     applications and auth modules
├── shared/       API, auth stores, hooks, and reusable components
├── assets/       static legal HTML and SVG assets
└── test/         Vitest and Testing Library tests
```

The `@/` alias points to `src/`. SVGs use `vite-plugin-svgr` and can be imported with `?react`.

## Routing and App Shell

TanStack Router uses the manually defined route tree in `src/app/router.tsx`:

- `/` renders the authenticated application shell (`App`), which bootstraps the session and chooses the auth screen or board.
- `/privacy` renders the static privacy-policy HTML.
- `/terms-and-conditions` renders the static terms HTML.

The app shell owns the global footer. Legal routes are public and do not pass through authenticated board data loading.

Create, edit, and detail views are not routes. They are overlays controlled by board-local state:

- `selectedId` opens application detail.
- `formMode` opens create or edit forms.
- Profile state controls logout and account deletion.

## Data Flow

```text
API client
  -> feature API / React Query hook
    -> ApplicationBoard
      -> columns, tiles, forms, and detail overlays
```

The board query uses the `['applications']` query key. Mutations invalidate or refresh that query after completion. Query defaults and mutation scopes are configured in `app/providers.tsx`.

## Board and Drag-and-Drop

`ApplicationBoard` coordinates `@dnd-kit` and the application cache:

1. Drag start stores a snapshot and marks the active tile.
2. Drag over updates cross-column placement locally.
3. Drag end compares the result with the snapshot and sends `PATCH /api/board/move/{id}` when status or position changed.
4. A failed move restores the snapshot.

Column IDs are status strings; tile IDs are application ID strings. Pure ordering rules live in `features/applications/model/boardOrdering.ts`. Cache snapshot and restore behavior lives in `applicationsCache.ts`.

The board is viewport-bound. Horizontal overflow belongs to the columns row; vertical overflow belongs to each column list. This keeps the page and footer stable while long columns remain scrollable.

## Authentication

- The access JWT is held in memory.
- `loggedInLocally` in local storage controls whether startup attempts session restoration.
- The browser manages the HttpOnly refresh cookie through API requests.
- `apiClient` sends credentials, adds the Bearer token, and performs one shared refresh/retry after a `401`.
- Failed refresh clears the access token and local login flag.
- Logout and account deletion clear the React Query cache to prevent session data leaking between users.

`AuthScreen` handles login and registration. `App.tsx` shows a bootstrap state, then chooses `AuthScreen` or `ApplicationBoard` based on the access token.

## Shared UI and Error Handling

`Modal` provides the base overlay. `ConfirmDialog` handles destructive confirmations. `ActionErrorBanner` presents dismissible action errors.

Application forms compare current values with their initial values and ask for confirmation before discarding edits. The comparison belongs in the applications model layer so it can be tested without rendering components.

## Testing

Tests run with Vitest and jsdom.

| Area | Focus |
|------|-------|
| `shared/apiClient.test.ts` | URL building, JSON, credentials, auth headers, and refresh retry |
| `shared/auth/*` | Token and local-login stores plus auth API behavior |
| `model/*` | Board ordering, cache behavior, and pure form-state rules |
| `hooks/*` | Mutation invalidation and account deletion |

There is no full-board end-to-end suite yet; most UI behavior is covered through pure model tests and hook tests.

Operational setup belongs in [README.md](README.md). Legal content is stored in `src/assets/` and rendered through the shared legal-document component.
