## ADDED Requirements

### Requirement: Payment domain model
The payments-service SHALL persist payments with an identifier, order identifier, amount, status, creation timestamp, and payment timestamp.

#### Scenario: Persist a processed payment
- **WHEN** a valid mock payment is processed
- **THEN** payments-service stores its order identifier, amount, approved status, creation timestamp, and payment timestamp

### Requirement: Process mock payment
The payments-service SHALL expose `POST /payments` to process a valid mock payment.

#### Scenario: Process a valid payment
- **WHEN** a client posts a valid order identifier and amount
- **THEN** payments-service logs the mock processing operation, persists an approved payment, and responds with HTTP 201 and the payment

### Requirement: Retrieve payment status
The payments-service SHALL expose `GET /payments/:id` to retrieve one persisted payment with its status.

#### Scenario: Retrieve an existing payment
- **WHEN** a client requests an existing payment identifier
- **THEN** payments-service responds with HTTP 200 and the persisted payment including its status

#### Scenario: Retrieve a missing payment
- **WHEN** a client requests an unknown payment identifier
- **THEN** payments-service responds with HTTP 404

### Requirement: Retrieve payments by order
The payments-service SHALL expose `GET /payments/order/:orderId` to retrieve persisted payments for one order with their statuses.

#### Scenario: Retrieve payments for an order
- **WHEN** a client requests an order identifier
- **THEN** payments-service responds with HTTP 200 and a list of persisted payments for that order including their statuses

### Requirement: Database setup
The payments-service SHALL provide an executable migration for the payments table.

#### Scenario: Prepare the local payments database
- **WHEN** a developer runs the documented migration command against an empty payments database
- **THEN** the payments schema exists
