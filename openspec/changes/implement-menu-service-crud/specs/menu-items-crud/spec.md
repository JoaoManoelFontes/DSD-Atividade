## ADDED Requirements

### Requirement: Menu item domain model
The menu-service SHALL persist menu items with an identifier, name, description, price, and availability.

#### Scenario: Persist a complete menu item
- **WHEN** a valid menu item is created
- **THEN** menu-service stores its name, description, price, and availability under a generated identifier

### Requirement: Create menu item
The menu-service SHALL expose `POST /menu-items` to create a valid menu item.

#### Scenario: Create a valid menu item
- **WHEN** a client posts a valid menu item
- **THEN** menu-service responds with HTTP 201 and the persisted menu item

### Requirement: List menu items
The menu-service SHALL expose `GET /menu-items` to list persisted menu items.

#### Scenario: List persisted menu items
- **WHEN** a client requests the menu item collection
- **THEN** menu-service responds with HTTP 200 and the persisted menu items

### Requirement: Retrieve menu item
The menu-service SHALL expose `GET /menu-items/:id` to retrieve one persisted menu item.

#### Scenario: Retrieve an existing menu item
- **WHEN** a client requests an existing menu item identifier
- **THEN** menu-service responds with HTTP 200 and the persisted menu item

#### Scenario: Retrieve a missing menu item
- **WHEN** a client requests an unknown menu item identifier
- **THEN** menu-service responds with HTTP 404

### Requirement: Update menu item
The menu-service SHALL expose `PUT /menu-items/:id` to replace the editable values of one persisted menu item.

#### Scenario: Update an existing menu item
- **WHEN** a client submits valid replacement values for an existing menu item
- **THEN** menu-service responds with HTTP 200 and the updated menu item

### Requirement: Delete menu item
The menu-service SHALL expose `DELETE /menu-items/:id` to delete one persisted menu item.

#### Scenario: Delete an existing menu item
- **WHEN** a client deletes an existing menu item
- **THEN** menu-service responds with HTTP 204 and the item is no longer persisted

### Requirement: Database setup
The menu-service SHALL provide an executable migration and a development seed for menu items.

#### Scenario: Prepare the local menu database
- **WHEN** a developer runs the documented migration and seed commands against an empty menu database
- **THEN** the schema exists and sample menu items are persisted
