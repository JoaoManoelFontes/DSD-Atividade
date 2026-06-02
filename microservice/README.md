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
| `notifications-service` | `3004` | - | MailHog SMTP on `1025`, web UI on `8025`; RabbitMQ on `5672`, management UI on `15672` |

The notifications stack includes RabbitMQ because payment approval events are consumed asynchronously.

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

This version contains the four independently deployable Fastify services and health checks. Services that currently need persistence own isolated PostgreSQL containers.

The `menu-service` also implements its isolated PostgreSQL model, Drizzle migrations, development seed, and CRUD endpoints.

The `orders-service` implements its isolated PostgreSQL model, Drizzle migrations, CRUD endpoints, synchronous menu-item validation, HTTP payment initiation, and asynchronous payment-status updates. New orders start with `PENDING` status and become `APPROVED` after a RabbitMQ event.

The `payments-service` implements its isolated PostgreSQL model, Drizzle migrations, mock approved payment processing with logs, status queries, and `payment.approved` RabbitMQ publication.

The `notifications-service` consumes payment approval events from its own `email.notifications` queue and sends email through MailHog without persistence.

## Communication, Resilience, and Errors

| Flow | Type | Summary |
| --- | --- | --- |
| `orders-service` -> `menu-service` | Synchronous HTTP | Validates whether a menu item exists and is available. |
| `orders-service` -> `payments-service` | Synchronous HTTP | Starts mock payment processing with an explicit timeout. |
| `payments-service` -> RabbitMQ -> `orders-service` | Asynchronous event | Updates the order after `payment.approved`. |
| `payments-service` -> RabbitMQ -> `notifications-service` | Asynchronous event | Sends the kitchen email after `payment.approved`. |

RabbitMQ uses durable queues, persistent messages, and publisher confirmations. Consumers discard invalid events and requeue messages after operational failures, such as an unavailable SMTP server. HTTP errors return clear status codes: `400` for invalid menu items, `503` when the menu service is unavailable, and `502` when payment processing cannot be requested.
