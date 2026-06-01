## Why

The microservices version needs its first domain service beyond the runtime skeleton. Implementing the menu CRUD establishes the isolated menu-service database model and the HTTP API needed by later order flows.

## What Changes

- Add the `menu_items` domain model to menu-service.
- Add PostgreSQL persistence with Drizzle ORM.
- Add an executable Drizzle migration and a development seed.
- Add REST endpoints to create, list, retrieve, update, and delete menu items.
- Add menu-service-specific run, migration, seed, and API usage documentation.

## Capabilities

### New Capabilities

- `menu-items-crud`: Persisted CRUD operations for menu items owned by menu-service.

### Modified Capabilities

None.

## Impact

- Updates `microservice/menu-service`.
- Adds Drizzle ORM, PostgreSQL driver, and Drizzle Kit dependencies to menu-service.
- Adds the public HTTP endpoints `/menu-items` and `/menu-items/:id`.
- Does not add communication with other microservices.
