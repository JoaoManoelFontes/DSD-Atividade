# Notifications Service

Microservice responsible for consuming payment approval events and sending emails through
SMTP to MailHog for local inspection. It does not expose an HTTP endpoint for sending
emails and does not use a persistence layer.

## Run with Docker Compose

Create the local environment file and start the service with MailHog and RabbitMQ:

```bash
cp .env.example .env
docker compose up --build
```

The API is available at `http://localhost:3004`. The MailHog web interface is
available at `http://localhost:8025`. The RabbitMQ management interface is available
at `http://localhost:15672` with user and password `guest`.

## Run Locally

Start MailHog and RabbitMQ:

```bash
docker compose up -d mailhog rabbitmq
```

Install dependencies, point the application to the ports exposed by the local
containers, and start the service:

```powershell
npm install
$env:SMTP_HOST="localhost"
$env:RABBITMQ_URL="amqp://guest:guest@localhost:5672"
npm run dev
```

## Endpoints

```txt
GET /health
```

## RabbitMQ Topology

```txt
exchange:    payments.events
queue:       email.notifications
routing key: payment.approved
```

The service declares the direct exchange, durable queue, and binding when it starts.
It consumes payloads with this shape:

```json
{
  "eventType": "payment.approved",
  "paymentId": 1,
  "orderId": 123,
  "status": "APPROVED",
  "occurredAt": "2026-06-01T12:00:00.000Z"
}
```

Publish a message manually through the RabbitMQ management API:

```bash
curl -u guest:guest -X POST http://localhost:15672/api/exchanges/%2F/payments.events/publish \
  -H "Content-Type: application/json" \
  -d '{"properties":{},"routing_key":"payment.approved","payload":"{\"eventType\":\"payment.approved\",\"paymentId\":1,\"orderId\":123,\"status\":\"APPROVED\",\"occurredAt\":\"2026-06-01T12:00:00.000Z\"}","payload_encoding":"string"}'
```

Open `http://localhost:8025` to inspect the received email.

## Current Scope

The RabbitMQ consumer receives payment approval events and invokes the internal email function.
