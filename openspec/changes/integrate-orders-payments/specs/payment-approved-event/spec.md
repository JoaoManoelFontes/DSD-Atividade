## ADDED Requirements

### Requirement: Publish a payment approval domain event
The payments-service SHALL publish a persistent `payment.approved` domain event after persisting an approved mock payment.

#### Scenario: Approved mock payment
- **WHEN** payments-service persists an approved mock payment
- **THEN** it publishes an event containing the event type, payment identifier, order identifier, approved status, and occurrence timestamp

### Requirement: Route approval events independently
The RabbitMQ exchange SHALL route each `payment.approved` event to independent durable queues for orders-service and notifications-service.

#### Scenario: Payment approval has multiple consumers
- **WHEN** payments-service publishes a `payment.approved` event
- **THEN** orders-service and notifications-service can consume the event independently without sharing acknowledgements

### Requirement: Notify the kitchen from the payment event
The notifications-service SHALL consume `payment.approved` events and build the kitchen email from the order identifier in the event.

#### Scenario: Valid approved payment event
- **WHEN** notifications-service consumes a valid `payment.approved` event
- **THEN** it sends the kitchen email and acknowledges the message

#### Scenario: Invalid approved payment event
- **WHEN** a consumer receives an invalid payment approval payload
- **THEN** it logs the invalid payload and discards the message
