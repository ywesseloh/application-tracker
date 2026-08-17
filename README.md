# Application Tracker

A kanban-style job application tracker. Create applications, drag them across pipeline columns, and keep board order consistent on the server.

<img src="docs/screenshots/board.png" alt="Board Screenshot" width="1000"/>

## Features

- User registration and sign-in (access JWT + HttpOnly refresh cookie)
- Per-user boards; session restore on reload when locally logged in
- Drag-and-drop board with optimistic UI updates and rollback on failure
- Create, edit, view, and delete job applications
- Server-side board placement with densification when cards move between columns
- Full-stack Docker Compose setup (Postgres + API + SPA)
- Local development with an in-memory H2 database (no Docker required)

## Documentation

| Area | README | Architecture |
|------|--------|--------------|
| Backend (Spring Boot API) | [backend/README.md](backend/README.md) | [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md) |
| Frontend (React SPA) | [frontend/README.md](frontend/README.md) | [frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md) |

Auth details (public vs protected routes, cookies, CORS, SPA bootstrap) live in the architecture docs above.

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, TypeScript, Vite, TanStack Query, @dnd-kit |
| Backend | Java 26, Spring Boot 4, Spring Security, Spring Data JPA, Bean Validation |
| Database | H2 (local default), PostgreSQL (Docker / postgres profile) |
| Infra | Docker Compose, multi-stage Dockerfiles, nginx (SPA) |

## Quick start (Docker)

Requires [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
cd docker
docker compose --env-file .env.dev up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Postgres | `localhost:5432` |

Open the frontend, create an account (or sign in), then use the board. Stop with `Ctrl+C`, or run detached with `docker compose --env-file .env.dev up --build -d` and stop with `docker compose down` (from the `docker/` directory).

Compose reads secrets and ports from [`docker/.env.dev`](docker/.env.dev).

### Production (Docker)

Copy [`docker/.env.prod.example`](docker/.env.prod.example) to `docker/.env.prod`, set secrets and your public hostname, point DNS at the server, then:

```bash
cd docker
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  --env-file .env.prod up -d --build
```

The prod override adds **Caddy** (HTTPS + same-origin routing), **Postgres persistence**, `restart: unless-stopped`, and stops publishing DB/backend/frontend ports publicly. Do not commit `.env.prod`.

From the repo root you can instead run:

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env.dev up --build
```

## Local development

### Prerequisites

- **JDK 26** (backend)
- **Node.js 22+** (frontend)
- Optional: Docker, if you want Postgres instead of H2

### Backend

See [backend/README.md](backend/README.md) for profiles, Postgres setup, and tests.

```bash
cd backend
./gradlew bootRun
```

API: http://localhost:8080 (H2 by default)

### Frontend

See [frontend/README.md](frontend/README.md) for scripts, env vars, and tests.

```bash
cd frontend
npm install
npm run dev
```

Dev server: http://localhost:5173

Create an account via **Create an account** on the auth screen (or **Sign in** if you already registered), then use the board.

## Project layout

```
application-tracker/
├── backend/                 # Spring Boot API → backend/README.md
├── frontend/                # React SPA → frontend/README.md
└── docker/
    ├── docker-compose.yml       # Full stack (db + backend + frontend)
    ├── docker-compose.prod.yml  # Prod override (Caddy, volumes, internal ports)
    ├── docker-compose-db.yml    # Postgres only (local apps on the host)
    ├── Caddyfile                # Reverse proxy (/ → SPA, /api → backend)
    ├── .env.dev                 # Local Compose env (ports, DB, JWT, CORS)
    └── .env.prod.example        # Prod env template (copy to .env.prod)
```

## Notes

- Board and application APIs require a JWT. Register and auth endpoints are public. Fine for a local/demo portfolio project; not production-hardened.
- The frontend talks to the API from the browser, so Compose uses `http://localhost:8080` as the API base URL (`VITE_API_BASE_URL` in `.env.dev`)—not the Docker service hostname `backend`.
- Infra lives under [`docker/`](docker/); run Compose from that directory (or pass `-f` / `--env-file` paths from the repo root).

## License

This project is licensed under the [MIT License](LICENSE).
