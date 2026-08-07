# Backend

Spring Boot API for the [Application Tracker](../README.md). Manages job applications and kanban board placement (move / reorder with densification).

For layers, domain model, and the board-move algorithm, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Stack

- Java 26
- Spring Boot 4 (Web MVC, Data JPA, Validation)
- H2 (default local profile) and PostgreSQL
- Gradle, Lombok
- JUnit for controller and service tests

## Prerequisites

- JDK 26
- Optional: Docker for PostgreSQL (`../docker-compose-db.yml`)

## Run

### H2 (default)

```bash
./gradlew bootRun
```

Uses the `h2` profile (`spring.profiles.active=h2` in `application.properties`).  
API: http://localhost:8080

### PostgreSQL

```bash
# from repo root
docker compose -f docker-compose-db.yml up -d

./gradlew bootRun --args='--spring.profiles.active=postgres'
```

Credentials and URL are in `src/main/resources/application-postgres.properties` (defaults: `postgres` / `postgres` on `localhost:5432`).

Override via environment variables if needed, for example:

```bash
export SPRING_PROFILES_ACTIVE=postgres
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/application-tracker
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
./gradlew bootRun
```

## Profiles

| Profile | Config file | Database |
|---------|-------------|----------|
| `h2` | `application-h2.properties` | In-memory H2 |
| `postgres` | `application-postgres.properties` | PostgreSQL |

Shared settings live in `application.properties`.

## Tests

```bash
./gradlew test
```

Coverage includes application CRUD and board move/reorder behavior (controller + service tests).

## Docker

Built from the repo root Compose file (`../docker-compose.yml`) or alone:

```bash
docker build -t application-tracker-backend .
docker run --rm -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=postgres \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/application-tracker \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  application-tracker-backend
```

Prefer `docker compose up --build` from the repo root so the backend joins the Compose network and can reach the `db` service.

## API

All endpoints are under the `/api` prefix (e.g. `/board` is served as `/api/board`).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/board` | Board with applications by status |
| `PATCH` | `/board/move/{id}` | Move / reorder a card |
| `GET` | `/applications` | List applications |
| `GET` | `/applications/{id}` | Get one application |
| `POST` | `/applications` | Create |
| `PUT` | `/applications/{id}` | Update |
| `DELETE` | `/applications/{id}` | Delete |

Controllers use open CORS for local frontend development. There is no authentication yet.

## Package layout

```
src/main/java/com/example/application_tracker/
├── controller/     # HTTP endpoints
├── service/        # Business logic (applications + board)
├── repository/     # Spring Data JPA
├── model/          # Entities and status enum
├── dto/            # Request/response payloads
└── common/         # Exceptions and global error handling
```
