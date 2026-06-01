## Context

The menu-service currently exposes only `GET /health` and already owns an isolated PostgreSQL container. This change adds the smallest useful domain slice for the microservices version: persisted menu items and their CRUD API.

## Goals / Non-Goals

**Goals:**

- Model menu items with name, description, price, and availability.
- Persist menu items in the database already owned by menu-service.
- Manage the schema with Drizzle ORM and an executable migration.
- Provide a simple seed for local development.
- Keep route behavior easy to inspect for the academic comparison.

**Non-Goals:**

- Add categories, images, inventory, authentication, or pagination.
- Add communication with orders-service.
- Add a repository abstraction or shared packages before they are needed.
- Add production deployment automation.

## Decisions

### Single `menu_items` table

The service stores `id`, `name`, `description`, `price`, and `available`. Prices use PostgreSQL `numeric(10, 2)` to avoid floating-point storage errors. A more elaborate catalog model was considered but is outside the assignment.

### Direct Drizzle usage in the Fastify application

Routes use the small Drizzle database client directly. A repository and service layer were considered but would add indirection without meaningful domain behavior in this slice.

### JSON Schema validation at the HTTP boundary

Fastify route schemas validate required fields and basic value constraints. This keeps invalid requests away from the database without adding a separate validation dependency.

### Migration and seed as explicit commands

Drizzle Kit generates and runs SQL migrations. A TypeScript seed inserts a small starter menu and ignores already existing item names, making repeated local setup convenient.

## Risks / Trade-offs

- [Route file contains persistence calls] -> Keep the CRUD small; introduce a separate layer only when domain behavior grows.
- [Name uniqueness is stricter than the assignment requires] -> Use it to make the seed repeatable and keep the sample catalog understandable.
- [Database must be reachable before migration and seed commands run] -> Document the setup order in the menu-service README.
