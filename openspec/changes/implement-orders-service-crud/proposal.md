## Why

The orders service currently exposes only a health check. The next incremental slice is to let it own orders while validating menu items through the menu service HTTP API.

## What Changes

- Add isolated PostgreSQL persistence for orders.
- Add create, list, get, update, and delete endpoints for orders.
- Store the selected menu item reference, item name snapshot, price snapshot, customer name, and payment status.
- Validate the selected item through `menu-service` during order creation and update.
- Keep payment processing out of scope; new orders start with `PENDING` payment status.

## Capabilities

### New Capabilities

- `orders-crud`: Order persistence, CRUD endpoints, and synchronous menu item validation.

### Modified Capabilities

None.

## Impact

- `microservice/orders-service` gains Drizzle ORM, PostgreSQL migrations, a menu-service HTTP client, CRUD endpoints, and run documentation.
- The orders service requires a `MENU_SERVICE_URL` configuration value.
- No payment-service integration is added in this change.
