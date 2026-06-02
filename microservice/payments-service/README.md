# Payments Service

Microservice responsible for mock payment processing. It owns its PostgreSQL database,
logs each processing operation, persists approved payments, publishes payment
approval events through RabbitMQ, and exposes status queries.

## Domain Model

Each payment contains:

| Field | Type | Description |
| --- | --- | --- |
| `id` | integer | Generated identifier |
| `orderId` | integer | Related order identifier |
| `amount` | number | Payment amount with two decimal places |
| `status` | string | `PENDING`, `APPROVED`, or `REJECTED` |
| `createdAt` | string | Creation timestamp |
| `paidAt` | string or null | Approval timestamp |

The current mock processing always persists payments as `APPROVED`.

## Run with Docker Compose

Start the notifications stack first so RabbitMQ and the shared Docker network exist:

```bash
cd ../notifications-service
cp .env.example .env
docker compose up -d --build
cd ../payments-service
```

Create the local environment file and start the service with its PostgreSQL database:

```bash
cp .env.example .env
docker compose up --build
```

The container applies pending migrations before starting the HTTP server. The API is available at `http://localhost:3003`.

## Run Locally

Start PostgreSQL and RabbitMQ:

```bash
docker compose up -d payments-db
cd ../notifications-service
docker compose up -d rabbitmq
cd ../payments-service
```

Install dependencies, point the application to the exposed database and RabbitMQ
ports, apply migrations, and start the service:

```powershell
npm install
$env:DATABASE_URL="postgresql://payments:payments@localhost:5433/payments"
$env:RABBITMQ_URL="amqp://guest:guest@localhost:5672"
npm run db:migrate
npm run dev
```

Generate a migration after changing `src/db/schema.ts`:

```bash
npm run db:generate
```

## Endpoints

```txt
GET  /health
POST /payments
GET  /payments/:id
GET  /payments/order/:orderId
```

Process a mock payment:

```bash
curl -X POST http://localhost:3003/payments \
  -H "Content-Type: application/json" \
  -d '{"orderId":1,"amount":29.9}'
```

After persisting the approved payment, the service publishes this domain event to the
`payments.events` exchange with routing key `payment.approved`:

```json
{
  "eventType": "payment.approved",
  "paymentId": 1,
  "orderId": 1,
  "status": "APPROVED",
  "occurredAt": "2026-06-01T12:00:00.000Z"
}
```

The `orders-service` and `notifications-service` consume the event independently.

Retrieve its status:

```bash
curl http://localhost:3003/payments/1
curl http://localhost:3003/payments/order/1
```
