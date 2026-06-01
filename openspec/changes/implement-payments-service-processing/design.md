## Context

The payments-service currently exposes only `GET /health` and already owns an isolated PostgreSQL container. This change adds the minimum payment domain behavior required by the assignment: mock processing, persistence, logging, and status queries.

## Goals / Non-Goals

**Goals:**

- Model payments with order identifier, amount, status, creation timestamp, and payment timestamp.
- Persist payments in the database already owned by payments-service.
- Manage the schema with Drizzle ORM and an executable migration.
- Log each mock payment processing operation.
- Expose status queries by payment identifier and order identifier.

**Non-Goals:**

- Integrate with a real payment provider.
- Add rejection simulation, retries, idempotency keys, or refund behavior.
- Call orders-service or publish RabbitMQ events.
- Add repository abstractions or shared packages before they are needed.

## Decisions

### Mock processing approves immediately

`POST /payments` logs the mock processing operation and persists an `APPROVED` payment with `paidAt` set. A multi-step pending flow was considered but deferred because this slice only needs the assignment's simple mock payment.

### Single `payments` table

The service stores `id`, `orderId`, `amount`, `status`, `createdAt`, and `paidAt`. Amounts use PostgreSQL `numeric(10, 2)` to avoid floating-point storage errors.

### Direct Drizzle usage in Fastify routes

Routes use the small Drizzle database client directly. A repository and service layer were considered but add indirection without useful domain complexity in this slice.

### Query payments by identifier and order

`GET /payments/:id` retrieves one payment. `GET /payments/order/:orderId` returns a list so the API remains accurate if the same order receives more than one mock processing attempt.

## Risks / Trade-offs

- [Every mock payment is approved] -> Keep the behavior explicit and add failure simulation in the later comparative experiment.
- [Repeated requests can create multiple payments for one order] -> Return all attempts by order; add idempotency only when the integration requires it.
- [Database must be reachable before migrations run] -> Document the setup order and apply migrations before container startup.
