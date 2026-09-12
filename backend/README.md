# Backend

Spring Boot API for the Application Tracker demo. It manages users, private job applications, authentication, and board ordering.

## Prerequisites

- JDK 26
- Optional: Docker for PostgreSQL

## Run With H2

H2 is the default local profile and requires no database setup:

```bash
./gradlew bootRun
```

The API runs at http://localhost:8080.

## Run With PostgreSQL

From the repository root, start PostgreSQL:

```bash
cd infra/docker
docker compose -f docker-compose-db.yml up -d
```

In another terminal, start the backend with the PostgreSQL profile:

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=postgres'
```

Database defaults and environment-variable overrides are documented in `src/main/resources/application-postgres.properties`.

## Profiles and Configuration

| Profile | Database | Configuration |
|---------|----------|---------------|
| `h2` | In-memory H2 | `application-h2.properties` |
| `postgres` | PostgreSQL | `application-postgres.properties` |
| `prod` | External production database | `application-prod.properties` |

Shared settings are in `application.properties`. Authentication, refresh-cookie, and CORS settings use the `security.*` and `app.cors.*` properties.

## API Overview

### Public

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/user` | Register |
| `POST` | `/auth/login` | Login → access JWT + refresh cookie |
| `POST` | `/auth/refresh` | Refresh access JWT (cookie) |
| `POST` | `/auth/logout` | Revoke refresh token and clear cookie |

### Authenticated (Bearer JWT)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/user` | Get current user |
| `DELETE` | `/user` | Delete current user |
| `GET` | `/board` | Board with applications by status |
| `PATCH` | `/board/move/{id}` | Move / reorder a card |
| `GET` | `/applications` | List applications |
| `GET` | `/applications/{id}` | Get one application |
| `POST` | `/applications` | Create |
| `PUT` | `/applications/{id}` | Update |
| `DELETE` | `/applications/{id}` | Delete |

## Tests

```bash
./gradlew test
```

## Docker

Build and run the backend image:

```bash
docker build -t application-tracker-backend .
docker run --rm -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=postgres \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/application-tracker \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  application-tracker-backend
```

For the complete stack, use the root [Docker quick start](../README.md#quick-start-with-docker).

## Further Reading

- [Backend architecture](ARCHITECTURE.md)
- [Root project README](../README.md)
