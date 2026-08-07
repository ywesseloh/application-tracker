# Backend architecture

Spring Boot API that owns job applications and kanban board placement. Controllers stay thin; services hold transactional board logic; JPA repositories persist applications and placements.

## Layers

```
HTTP (controllers)
  → services (transactions + board rules)
    → repositories (JPA / JPQL)
      → PostgreSQL or H2
```

Package root: `com.example.application_tracker`

| Package | Responsibility |
|---------|----------------|
| `controller` | REST endpoints, CORS |
| `service` | Application lifecycle and board move/reorder |
| `repository` | Spring Data JPA |
| `model` | Entities and status enum |
| `dto` | Request/response payloads |
| `common` | Domain exceptions and `@RestControllerAdvice` |

## Domain model

```
JobApplication 1 ── 1 BoardPlacement
     │                      │
  company, role,         status + position
  status, notes,         (unique per column)
  jobPostingUrl
```

- **`JobApplication`** — core entity (`job_application`). Status is stored here as the application’s pipeline state (list/detail APIs, updates).
- **`BoardPlacement`** — one row per application (`board_placement`). Shares the application id via `@MapsId`. Holds the column (`status`) and dense `position` (`0 … n-1`).
- **Uniqueness:** `(status, position)` must be unique (`uc_status_position`). That constraint drives the park-then-shift move algorithm.
- **`JobApplicationStatus`:** `WISHLIST` → `APPLIED` → `INTERVIEW` → `OFFER` → `REJECTED`.

Placement is owned by the application (`cascade = ALL`, `orphanRemoval = true`). Creating an application always appends a placement at the end of the target column.

### Why `status` is denormalized

Both `job_application.status` and `board_placement.status` store the same enum. That duplication is intentional:

1. **Board uniqueness is column-scoped.** The unique key is `(status, position)` on `board_placement`. Position only makes sense inside a column, so the column key has to live on the placement row—not only on the application.
2. **Board writes stay on one table.** Compact / increment / park / count queries filter and update `BoardPlacement` by `status` and `position` without joining `JobApplication`. Keeping status on the placement avoids join-heavy bulk JPQL and keeps moves cheaper.
3. **Board reads order by placement alone.** `findAllWithApplicationOrdered` sorts by `p.status, p.position`, then join-fetches the application for display fields.
4. **Application status remains the domain field.** List/detail payloads and non-board updates still treat `JobApplication.status` as source of truth for “where is this application in the pipeline?”

`BoardService.move` always updates **both** sides together so they stay aligned. The tradeoff is consistency discipline (never change one without the other) in exchange for a placement table that can enforce and maintain board order on its own.

## Request flows

### Create application

```
POST /applications
  → create and save new job application
  → create and save board placement at the end of the status column
```

### Move / reorder

```
PATCH /board/move/{id}  +  { status, columnPosition }
  → compact the source column (shift neighbors down)
  → increment the target column (shift neighbors up)
  → for the specified id, update JobApplication status as well as BoardPlacement status and columnPosition 
```

Updating an application’s status via `PUT /applications/{id}` appends the application to the end of the new column. Positions past the allowed end raise `IllegalPositionException`.

### Delete

```
DELETE /applications/{id}
  → compact the source column (shift neighbors down)
  → delete application by id (placement removed by orphanRemoval)
```

## Board ordering algorithm
1. **Park** the `movingRow` at `PARK_OFFSET + applicationId` (`1_000_000 + id`) via `parkPlacement`. This prevents violating uniqueness constraints during the algorithm.
2. **Compact** the source column: neighbors with `position > movingRow.oldPosition` get `position -= 1`
3. **Open a slot** in the target column: neighbors with `position >= movingRow.newPosition` get `position += 1`
4. **Write** the final `status` + `position` on application and placement

## API surface

All controllers use `@RequestMapping("/api")`. Paths below are resource paths; the full URL is `/api` + path (e.g. `/board` → `/api/board`).

| Method | Path | Handler |
|--------|------|---------|
| `GET` | `/board` | Board with `JobApplicationBoardItem` (includes `columnPosition`) |
| `PATCH` | `/board/move/{id}` | Move / reorder (`JobApplicationPatch`) |
| `GET` | `/applications` | List (`JobApplicationItem`) |
| `GET` | `/applications/{id}` | Detail |
| `POST` | `/applications` | Create (`JobApplicationMutation`) |
| `PUT` | `/applications/{id}` | Update |
| `DELETE` | `/applications/{id}` | Delete |

## Error handling

`GlobalExceptionHandler` maps:

| Exception | Status |
|-----------|--------|
| `ConstraintViolationException` | 400 |
| `IllegalPositionException` | 400 |
| `ResourceNotFoundException` | 404 |

## Configuration

| File | Role |
|------|------|
| `application.properties` | App name; default active profile `h2` |
| `application-h2.properties` | In-memory H2, console, seed via `data.sql` |
| `application-postgres.properties` | Local/Compose Postgres |

Docker Compose sets `SPRING_PROFILES_ACTIVE=postgres` and datasource env vars so the API can reach the `db` service.

## Tests

Under `src/test/java/...`:

- **Controller** — MockMvc for HTTP status and JSON (`BoardControllerTest`, `JobApplicationControllerTest`)
- **Service** — transactional Spring tests for densify, cross-column move, append, illegal position, CRUD
- **Support** — `BoardTestSupport` shared seed/assert helpers

Tests disable `data.sql` seeding (`src/test/resources/application.properties`).
