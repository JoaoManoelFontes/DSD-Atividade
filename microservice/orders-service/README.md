# Orders Service

Microservice responsible for snack bar orders. It owns its PostgreSQL database, validates menu items through menu-service, requests payment processing through payments-service, and consumes payment approval events from RabbitMQ.

## Domain Model

Each order contains:

| Field | Type | Description |
| --- | --- | --- |
| `id` | integer | Generated identifier |
| `menuItemId` | integer | Identifier validated through menu-service |
| `itemName` | string | Menu item name snapshot |
| `price` | number | Menu item price snapshot |
| `requestedBy` | string | Customer name |
| `paymentStatus` | string | Starts as `PENDING` and becomes `APPROVED` asynchronously |
| `createdAt` | date | Creation timestamp |
| `updatedAt` | date | Last update timestamp |

## Run with Docker Compose

Start `notifications-service` first so RabbitMQ and the shared Docker network exist. Start `menu-service` and `payments-service` next. Then create the local environment file and start this service with its PostgreSQL database:

```bash
cp .env.example .env
docker compose up --build
```

The container applies pending migrations before starting the HTTP server. The API is available at `http://localhost:3002`.

## Run Locally

Start PostgreSQL:

```bash
docker compose up -d orders-db
```

Install dependencies, point the application to the exposed database port and the local menu-service, apply migrations, and start the service:

```powershell
npm install
$env:DATABASE_URL="postgresql://orders:orders@localhost:5432/orders"
$env:MENU_SERVICE_URL="http://localhost:3001"
$env:PAYMENTS_SERVICE_URL="http://localhost:3003"
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
GET    /health
POST   /orders
GET    /orders
GET    /orders/:id
PUT    /orders/:id
DELETE /orders/:id
```

Create an order using an available menu item:

```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -d '{"menuItemId":1,"requestedBy":"Ana"}'
```

The service reads the menu item from `GET http://localhost:3001/menu-items/:id`, saves the order as `PENDING`, and requests payment processing from `POST http://localhost:3003/payments`.

If payment initiation fails, the persisted order remains `PENDING` and the endpoint returns `502` with its `orderId`. After payment approval, RabbitMQ delivers a `payment.approved` event through the durable `orders.payment-status` queue and the order becomes `APPROVED`.
