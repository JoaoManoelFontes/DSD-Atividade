## Why

The microservices version needs a payments capability that can process a mock payment and expose its persisted status. This creates the synchronous payment boundary needed by the later orders-service integration.

## What Changes

- Add the `payments` domain model to payments-service.
- Add PostgreSQL persistence with Drizzle ORM.
- Add an executable Drizzle migration.
- Add mock payment processing that logs the operation and persists an approved payment.
- Add REST endpoints to process a payment and retrieve status by payment or order identifier.
- Add payments-service-specific run, migration, and API usage documentation.

## Capabilities

### New Capabilities

- `payment-processing`: Persisted mock payment processing and status queries owned by payments-service.

### Modified Capabilities

None.

## Impact

- Updates `microservice/payments-service`.
- Adds Drizzle ORM, PostgreSQL driver, and Drizzle Kit dependencies to payments-service.
- Adds the public HTTP endpoints `/payments`, `/payments/:id`, and `/payments/order/:orderId`.
- Does not add communication with orders-service or RabbitMQ publishing yet.
