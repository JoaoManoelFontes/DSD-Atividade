# Microservices

Initial setup for the microservices version of the snack bar ordering system.

## Services

| Service | Port |
| --- | --- |
| `menu-service` | `3001` |
| `orders-service` | `3002` |
| `payments-service` | `3003` |
| `notifications-service` | `3004` |

## Infrastructure

Each microservice has its own `docker-compose.yml` and can be started independently.

| Service | HTTP Port | PostgreSQL Host Port | Additional Infrastructure |
| --- | --- | --- | --- |
| `menu-service` | `3001` | `5431` | - |
| `orders-service` | `3002` | `5432` | - |
| `payments-service` | `3003` | `5433` | - |
| `notifications-service` | `3004` | `5434` | RabbitMQ on `5672`, management UI on `15672` |

RabbitMQ belongs to the notifications stack for local development because the notification queue must have a single shared broker. Creating one broker per service would isolate publishers from consumers.

## Run with Docker Compose

Enter any service directory and run:

```bash
docker compose up --build
```

To run the complete setup, repeat the command in each of the four service directories. Check the health endpoints:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

Stop a service and its local infrastructure from its directory:

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

This slice creates the four independently deployable Fastify services, one isolated PostgreSQL container per service, the shared RabbitMQ broker needed by notifications, and health checks. Database access, RabbitMQ integration in application code, domain endpoints, and service communication will be added incrementally.
