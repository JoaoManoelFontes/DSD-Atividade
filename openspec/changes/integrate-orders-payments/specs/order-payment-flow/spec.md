## ADDED Requirements

### Requirement: Initiate payment after persisting an order
The orders-service SHALL persist a valid new order with `PENDING` payment status before requesting payment processing from payments-service through HTTP.

#### Scenario: Payment request is accepted
- **WHEN** a client creates an order for an available menu item and payments-service accepts the payment processing request
- **THEN** orders-service persists the order as `PENDING`, sends its identifier and price to `POST /payments`, and returns HTTP `201`

#### Scenario: Payment request fails
- **WHEN** orders-service persists a valid order but payments-service is unreachable, times out, or rejects the payment processing request
- **THEN** orders-service keeps the order as `PENDING`, logs the failure, and returns HTTP `502` with the persisted order identifier

### Requirement: Use an explicit payment HTTP timeout
The orders-service SHALL use an explicit timeout when requesting payment processing from payments-service.

#### Scenario: Payment request exceeds the timeout
- **WHEN** payments-service does not respond before the configured timeout expires
- **THEN** orders-service treats the request as failed and preserves the order with `PENDING` status

### Requirement: Synchronize approved payment status asynchronously
The orders-service SHALL consume `payment.approved` events from its own durable RabbitMQ queue and update the matching order payment status to `APPROVED`.

#### Scenario: Approved payment event for an existing order
- **WHEN** orders-service consumes a valid `payment.approved` event for an existing order
- **THEN** it updates that order payment status to `APPROVED` and acknowledges the message

#### Scenario: Duplicate approved payment event
- **WHEN** orders-service consumes the same valid `payment.approved` event more than once
- **THEN** the order remains `APPROVED` and each successfully handled delivery is acknowledged

#### Scenario: Approved payment event for a missing order
- **WHEN** orders-service consumes a valid `payment.approved` event for an order identifier that does not exist
- **THEN** it logs the missing order and discards the message
