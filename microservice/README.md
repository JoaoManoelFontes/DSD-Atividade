# Microservices

Initial setup for the microservices version of the snack bar ordering system.

## Services

| Service | Port |
| --- | --- |
| `menu-service` | `3001` |
| `orders-service` | `3002` |
| `payments-service` | `3003` |
| `notifications-service` | `3004` |

## Run with Docker Compose

From this directory:

```bash
docker compose up --build
```

Check the health endpoints:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

Stop the containers:

```bash
docker compose down
```

## Run one service locally

Enter a service directory and run:

```bash
npm install
npm run dev
```

Each service loads its own `.env` file. The `.env.example` file documents the expected variables.

## Current Scope

This first slice creates only the four independently deployable Fastify services and their health checks. Domain endpoints, PostgreSQL databases, RabbitMQ integration, and service communication will be added incrementally.
