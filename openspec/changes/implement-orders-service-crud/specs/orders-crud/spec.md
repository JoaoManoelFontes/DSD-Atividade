## ADDED Requirements

### Requirement: Create an order from an available menu item
The orders service SHALL create an order only after validating the requested menu item through the menu service. It SHALL store the menu item identifier, item name snapshot, price snapshot, customer name, and a `PENDING` payment status.

#### Scenario: Available menu item
- **WHEN** a client creates an order with a customer name and an available menu item identifier
- **THEN** the service returns the persisted order with HTTP status `201`

#### Scenario: Missing menu item
- **WHEN** a client creates an order with a menu item identifier that does not exist
- **THEN** the service rejects the request with HTTP status `400`

#### Scenario: Unavailable menu item
- **WHEN** a client creates an order with a menu item identifier that is not available
- **THEN** the service rejects the request with HTTP status `400`

#### Scenario: Menu service is unreachable
- **WHEN** the orders service cannot complete menu item validation because the menu service is unreachable
- **THEN** the service rejects the request with HTTP status `503`

### Requirement: List and retrieve orders
The orders service SHALL expose endpoints to list persisted orders and retrieve one persisted order by identifier.

#### Scenario: List orders
- **WHEN** a client lists orders
- **THEN** the service returns all persisted orders

#### Scenario: Existing order
- **WHEN** a client retrieves an existing order identifier
- **THEN** the service returns that order

#### Scenario: Missing order
- **WHEN** a client retrieves an order identifier that does not exist
- **THEN** the service returns HTTP status `404`

### Requirement: Update an order
The orders service SHALL allow a client to update the customer name and selected menu item of an existing order. It SHALL validate the selected menu item through the menu service and refresh the item name and price snapshots while preserving payment status.

#### Scenario: Update existing order
- **WHEN** a client updates an existing order with an available menu item and a customer name
- **THEN** the service returns the updated order

#### Scenario: Update missing order
- **WHEN** a client updates an order identifier that does not exist
- **THEN** the service returns HTTP status `404`

### Requirement: Delete an order
The orders service SHALL allow a client to delete an existing order.

#### Scenario: Delete existing order
- **WHEN** a client deletes an existing order identifier
- **THEN** the service removes the order and returns HTTP status `204`

#### Scenario: Delete missing order
- **WHEN** a client deletes an order identifier that does not exist
- **THEN** the service returns HTTP status `404`
