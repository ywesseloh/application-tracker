# Frontend

React and TypeScript SPA for the Application Tracker demo. It provides the authentication screen, kanban board, application forms, and legal pages.

## Prerequisites

- Node.js 22+
- Backend API running at http://localhost:8080, unless `VITE_API_BASE_URL` is set

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite with hot reload |
| `npm run build` | Typecheck and build the production bundle |
| `npm run preview` | Preview the production bundle |
| `npm test` | Run Vitest once |
| `npm run lint` | Run Oxlint |

## API URL

The default API URL is `http://localhost:8080`. You can override it at startup:

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

## Docker

Build and serve the SPA with nginx:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  -t application-tracker-frontend .
docker run --rm -p 5173:80 application-tracker-frontend
```

For the complete stack, use the root [Docker quick start](../README.md#quick-start-with-docker).

## Further Reading

- [Frontend architecture](ARCHITECTURE.md)
- [Root project README](../README.md)
