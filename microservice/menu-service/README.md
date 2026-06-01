# Menu Service

Microservice responsible for the snack bar menu. It owns its PostgreSQL database and exposes a small CRUD API for menu items.

## Domain Model

Each menu item contains:

| Field | Type | Description |
| --- | --- | --- |
| `id` | integer | Generated identifier |
| `name` | string | Unique item name |
| `description` | string | Item description |
| `price` | number | Price with two decimal places |
| `available` | boolean | Whether the item can currently be ordered |

## Run with Docker Compose

Create the local environment file and start the service with its PostgreSQL database:

```bash
cp .env.example .env
docker compose up --build
```

The container applies pending migrations before starting the HTTP server. The API is available at `http://localhost:3001`.

Run the seed inside the application container:

```bash
docker compose exec menu-service node --enable-source-maps dist/db/seed.js
```

## Run Locally

Start only PostgreSQL:

```bash
docker compose up -d menu-db
```

Install dependencies, point the application to the exposed database port, apply migrations, seed, and start the service:

```powershell
npm install
$env:DATABASE_URL="postgresql://menu:menu@localhost:5431/menu"
npm run db:migrate
npm run db:seed
npm run dev
```

Generate a migration after changing `src/db/schema.ts`:

```bash
npm run db:generate
```

## Endpoints

```txt
GET    /health
POST   /menu-items
GET    /menu-items
GET    /menu-items/:id
PUT    /menu-items/:id
DELETE /menu-items/:id
```

Create a menu item:

```bash
curl -X POST http://localhost:3001/menu-items \
  -H "Content-Type: application/json" \
  -d '{"name":"Cheeseburger","description":"Hamburger with cheese","price":19.9,"available":true}'
```

List menu items:

```bash
curl http://localhost:3001/menu-items
```
