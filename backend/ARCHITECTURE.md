# Backend architecture

Spring Boot API that owns job applications and kanban board placement. Controllers stay thin; services hold transactional board logic; JPA repositories persist applications and placements.

## Layers

```
HTTP (controllers)
  → services (transactions + board rules)
    → repositories (JPA / JPQL)
      → PostgreSQL or H2
```

Package root: `com.ywes.application_tracker`

| Package | Responsibility |
|---------|----------------|
| `controller` | REST endpoints, CORS, resolve current user from `Authentication` |
| `service` | Application lifecycle, board move/reorder, auth helpers |
| `repository` | Spring Data JPA |
| `model` | Entities and status enum |
| `dto` | Request/response payloads |
| `common` | Domain exceptions and `@RestControllerAdvice` |
| `config` | Security, JWT filter |

## Domain model

```
User 1 ──── * JobApplication 1 ──── 1 BoardPlacement
                  │                      │
               company, role,         userId + status + position
               status, notes,         (unique per user column)
               jobPostingUrl
```

- **`User`** — account (`users`). JWT subject is the username; controllers load the entity via `UserService`.
- **`JobApplication`** — core entity (`job_application`), owned by a required `user`. Status is the pipeline state (list/detail APIs, updates).
- **`BoardPlacement`** — one row per application (`board_placement`). Shares the application id via `@MapsId`. Holds denormalized `userId`, column (`status`), and dense `position` (`0 … n-1`).
- **Uniqueness:** `(userId, status, position)` must be unique (`uc_user_status_position`) so each user has an independent board.
- **`JobApplicationStatus`:** `WISHLIST` → `APPLIED` → `INTERVIEW` → `OFFER` → `REJECTED`.

Placement is owned by the application (`cascade = ALL`, `orphanRemoval = true`). Creating an application always appends a placement at the end of that user’s target column.

All list/move/create/update/delete operations are scoped to the authenticated user. The JWT carries `sub` (username) and `uid` (user id); the filter sets an `AuthUser` principal so handlers do not load the user from the database on every request. Create uses `UserRepository.getReferenceById` for the JPA association.

### Why `status` (and `userId`) are denormalized on placement

Both `job_application.status` and `board_placement.status` store the same enum; `board_placement.user_id` mirrors `job_application.user_id`. That duplication is intentional:

1. **Board uniqueness is per-user column-scoped.** The unique key is `(userId, status, position)` on `board_placement`.
2. **Board writes stay on one table.** Compact / increment / park / count queries filter and update `BoardPlacement` by `userId`, `status`, and `position` without joining `JobApplication`.
3. **Board reads order by placement alone.** `findAllWithApplicationOrdered(userId)` sorts by `p.status, p.position`, then join-fetches the application for display fields.
4. **Application status remains the domain field.** List/detail payloads still treat `JobApplication.status` as source of truth for pipeline state.

`BoardService.move` always updates application status and placement `status`/`position` together (and keeps `userId` unchanged).

## Request flows

### Create application

```
POST /applications
  → resolve User from Authentication
  → create and save job application owned by that user
  → create board placement (userId + status + end position)
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
| `MethodArgumentNotValidException` | 400 (DTO / `@Valid` failures) |
| `ConstraintViolationException` | 400 (entity validation on persist) |
| `IllegalPositionException` | 400 |
| `ResourceNotFoundException` | 404 |

Request DTOs (`JobApplicationMutation`, `JobApplicationPatch`) carry Bean Validation annotations and controllers use `@Valid`. Entity constraints remain as a persistence safety net.

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
