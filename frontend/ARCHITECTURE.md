# Frontend architecture

React SPA for the kanban board. One feature module (`applications`) owns UI, React Query hooks, and pure board/cache helpers. The shared layer provides the HTTP client and a reusable error banner.

There is **no client-side router** — create/edit/detail are overlays driven by local state on the board.

## High-level structure

```
src/
├── app/                         # bootstrap
│   ├── main.tsx                 # createRoot → providers → App
│   ├── providers.tsx            # QueryClient defaults
│   └── App.tsx                  # renders ApplicationBoard
├── features/applications/       # board feature (only feature)
├── shared/
│   ├── api/                     # apiClient, applicationsApi
│   └── components/              # ActionErrorBanner
└── test/                        # Vitest setup, fixtures, specs
```

Path alias: `@/` → `src/` (`vite.config.ts`).

## Feature module

```
features/applications/
├── components/
│   ├── ApplicationBoard/        # orchestration + DnD
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
- JSON helpers + 8s timeout
- `ApiError` (HTTP failure) and `NetworkError` (unreachable)

`shared/api/applicationsApi.ts` wraps board and application endpoints used by the hooks.

## Busy and error UX

| Concern | Behavior |
|---------|----------|
| Initial load | Spinner until first successful board fetch |
| Load failure | Full-page alert + Retry |
| Mutation errors | `ActionErrorBanner` (board / form / detail) with dismiss |
| Tile syncing | Spinner, `aria-busy`, sortable disabled |
| Board writes pending | New drags blocked; tiles disabled |

Hooks: `useBoardWritesBusy`, `useApplicationBusy`, `useApplicationActionError`.

## Tests

Vitest + jsdom (`src/test/`):

| Area | Focus |
|------|--------|
| `shared/apiClient.test.ts` | URL building, JSON, errors |
| `model/boardOrdering.test.ts` | Filter/sort, move, reorder, densify |
| `model/applicationsCache.test.ts` | Snapshot / restore / apply |
| `hooks/useApplicationMutations.test.tsx` | Invalidation after mutations |

No full-board component E2E suite yet — coverage targets ordering, cache, and API glue.
