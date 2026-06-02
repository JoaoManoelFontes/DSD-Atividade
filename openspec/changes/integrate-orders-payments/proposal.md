## Why

Orders are currently created with a pending payment status but do not initiate payment processing or receive payment results. This change connects the existing services while keeping payment status updates asynchronous and observable through RabbitMQ.

## What Changes

- Make orders-service persist a new order as `PENDING` and then request mock payment processing through `POST /payments`.
- Add an explicit timeout to the orders-service HTTP call to payments-service.
- Keep the persisted order as `PENDING` and return a visible gateway error when payment processing cannot be requested.
- Replace the payment publisher's email-specific RabbitMQ message with a `payment.approved` domain event.
- Make orders-service consume `payment.approved` events from its own durable queue and update the matching order payment status.
- Adapt notifications-service to consume the same `payment.approved` event from its own queue and send the kitchen email.
- Configure orders-service to reach payments-service and RabbitMQ.

## Capabilities

### New Capabilities

- `order-payment-flow`: HTTP payment initiation after order persistence and asynchronous payment status synchronization through RabbitMQ.
- `payment-approved-event`: A payment approval domain event consumed independently by orders-service and notifications-service.

### Modified Capabilities

None.

## Impact

- Updates `microservice/orders-service`, `microservice/payments-service`, and `microservice/notifications-service`.
- Adds RabbitMQ consumption to orders-service and a RabbitMQ client dependency.
- Changes the RabbitMQ payload consumed by notifications-service from an email command to a payment approval domain event.
- Adds `PAYMENTS_SERVICE_URL` and `RABBITMQ_URL` configuration to orders-service.
- Does not add retries, rejected payments, idempotency keys, or automatic recovery for failed HTTP payment initiation.
