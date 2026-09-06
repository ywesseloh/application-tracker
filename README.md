# Application Tracker

Application Tracker provides a kanban board for organizing job applications. Create applications, move them through a pipeline, and keep their order synchronized with the server.

The application is live at: https://job-tracker.ywesseloh.com

> **Demo application:** Use test data only. Do not enter real personal, confidential, or sensitive information.

<kbd><img src="docs/screenshots/board.png" alt="Application Tracker board" width="1000"/></kbd>

## Features

- Account registration and sign-in
- Private, per-user application boards
- Drag-and-drop status changes with optimistic updates
- Create, edit, view, and delete applications
- H2 for local development or PostgreSQL with Docker

## Quick Start With Docker

Requirements: [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
cd infra/docker
docker compose --env-file .env.dev up --build
```

Open [http://localhost:5173](http://localhost:5173) and create a test account.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| PostgreSQL | localhost:5432 |

Stop the stack with `Ctrl+C`, or use `docker compose down` from `infra/docker`.

## Local Development

Requirements:

- JDK 26
- Node.js 22+
- Optional: Docker for PostgreSQL

Start the backend with H2:

```bash
cd backend
./gradlew bootRun
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:8080

## Documentation

| Area | Setup | Architecture |
|------|-------|--------------|
| Backend | [backend/README.md](backend/README.md) | [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md) |
| Frontend | [frontend/README.md](frontend/README.md) | [frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md) |

## License

[MIT License](LICENSE)
