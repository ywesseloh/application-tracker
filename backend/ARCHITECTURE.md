# Backend Architecture

The backend is a Spring Boot API for users, private job applications, authentication, and kanban ordering. Controllers handle HTTP concerns; services own transactions and business rules; repositories persist the model.

## Request Flow

```text
HTTP request
  -> controller
    -> service
      -> repository / database
```

Package root: `com.ywes.application_tracker`

| Package | Responsibility |
|---------|----------------|
| `controller` | HTTP endpoints and current-user resolution |
| `service` | Authentication, application lifecycle, and board rules |
| `repository` | Spring Data JPA queries |
| `model` | Persistent entities and status enum |
| `dto` | Validated request and response types |
| `config` | Security, CORS, and refresh-cookie settings |
| `filters` | JWT authentication and request logging |
| `common` | Exceptions and global error handling |

## Domain Model

```text
User 1 --- 1 RefreshToken
  |
  1 --- * JobApplication 1 --- 1 BoardPlacement
```

- `User` owns applications and one refresh token.
- `JobApplication` stores company, role, status, notes, and job-posting URL.
- `BoardPlacement` stores a user-scoped status and dense column position.
- `JobApplicationStatus` is ordered as `WISHLIST`, `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`.
- User deletion cascades to applications, placements, and the refresh token.

### Placement Invariants

`BoardPlacement` deliberately duplicates the application status and user ID. This keeps board queries and writes scoped to one user and allows the database uniqueness rule `(userId, status, position)`.

Positions are dense, starting at `0`. Creating an application appends it to a column. Moving an application compacts its source column, opens a slot in the target column, and updates both the application and placement in one transaction.

To avoid temporary uniqueness conflicts during moves, `BoardService` parks the moving placement at a temporary position before compacting and inserting it into the target column.

## Authentication

- Login and refresh return a short-lived access JWT in JSON.
- The refresh token is stored server-side as a hash and sent to the browser in an HttpOnly cookie.
- Protected requests use `Authorization: Bearer <jwt>`.
- Refresh rotates the stored token and cookie.
- Logout revokes the refresh token and clears the cookie.
- Protected resources are scoped to the authenticated user ID.

`JwtAuthenticationFilter` establishes the current user from the access token. `RequestLoggingFilter` records method, URI, status, duration, and authenticated user ID without logging request bodies or authorization headers.

## API Boundaries

All controllers use the `/api` prefix.

| Access | Routes |
|--------|--------|
| Public | `POST /user`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Authenticated | `DELETE /user`, `/board`, and `/applications` CRUD/move routes |

DTOs use Bean Validation. `GlobalExceptionHandler` maps validation and domain failures to consistent error responses, including `400`, `401`, `404`, and `409` cases.

## Configuration

- `application.properties` selects the default H2 profile.
- `application-h2.properties` configures local H2.
- `application-postgres.properties` configures local/Compose PostgreSQL.
- `application-prod.properties` contains production-oriented settings.
- JWT, refresh-cookie, and CORS settings use `security.*` and `app.cors.*` properties.

Operational setup belongs in [README.md](README.md). Infrastructure scripts and Compose files live under `../infra/`.

## Tests

Backend tests cover controller contracts, authentication, CRUD, and board movement. Service tests focus on dense positions, cross-column moves, appends, invalid positions, and deletion behavior.
