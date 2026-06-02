## Context

The orders service is currently a Fastify health-check skeleton with an isolated PostgreSQL container. The menu service already owns menu items and exposes `GET /menu-items/:id`, including the item's current name, price, and availability.

## Goals / Non-Goals

**Goals:**

- Keep order persistence isolated inside `orders-service`.
- Provide a small CRUD API for orders.
- Validate menu items through the existing menu-service HTTP API before saving an order.
- Preserve the price used when the order is created or updated.

**Non-Goals:**

- Process payments or call `payments-service`.
- Publish events or notify the kitchen.
- Add retries, circuit breakers, or multi-item orders in this incremental change.

## Decisions

- Store one `menuItemId`, `itemName`, and `price` snapshot per order. This matches the requested initial domain and keeps historical orders readable if the menu changes later. Storing only a foreign identifier would lose the price used by the order.
- Set `paymentStatus` to `PENDING` inside the service. Clients do not control payment state because payment processing is intentionally deferred.
- Validate the selected item on create and update with `GET /menu-items/:id`. A missing item or unavailable item rejects the request. A menu-service communication failure returns a service-unavailable response.
- Use the existing Fastify, Drizzle ORM, PostgreSQL, and native `fetch` patterns. No additional HTTP client abstraction is needed beyond a small menu client module.
- Expose `POST /orders`, `GET /orders`, `GET /orders/:id`, `PUT /orders/:id`, and `DELETE /orders/:id` for a conventional CRUD surface.

## Risks / Trade-offs

- [Synchronous menu validation makes order writes depend on menu-service availability] -> Return an explicit `503` response so the partial degradation is visible.
- [A stored price snapshot can differ from the current menu price later] -> This is intentional: the order records the value used at its last write.
- [The first model supports only one item per order] -> Keep the schema small now and evolve it in a later OpenSpec change if the comparison requires multiple items.
