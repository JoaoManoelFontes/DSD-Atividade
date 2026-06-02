## Context

The orders-service already validates a menu item, stores a price snapshot, and creates an order with `PENDING` payment status. The payments-service already exposes `POST /payments`, stores an immediately approved mock payment, and publishes an email-specific RabbitMQ message. The notifications-service consumes that email message.

This change connects those existing slices. Orders must own their persisted status, payments must publish the payment fact, and notifications must remain independent from order persistence.

## Goals / Non-Goals

**Goals:**

- Persist an order as `PENDING` before requesting payment processing.
- Request payment processing from orders-service through HTTP with an explicit timeout.
- Update the order payment status asynchronously after consuming a RabbitMQ event.
- Publish one payment approval domain event that can be consumed independently by orders-service and notifications-service.
- Keep the implementation small enough to explain in the architectural comparison.

**Non-Goals:**

- Add rejected payment simulation, automatic retry, circuit breaker, outbox pattern, dead-letter queues, or idempotency keys.
- Change the existing single-item order model.
- Add a shared library between services.
- Solve concurrent order updates while a payment request is in flight.

## Decisions

### Persist the order before calling payments-service

`POST /orders` first validates the menu item and inserts an order with `paymentStatus = PENDING`. It then calls `POST /payments` with `{ orderId, amount }`. Persisting first guarantees that an approved event always has an order identifier to update.

Calling payments-service before inserting the order was considered but rejected because the event could arrive before the order exists.

### Keep the HTTP call synchronous and the status update asynchronous

Orders-service waits for the payment HTTP request to complete so it can report dispatch failures. It does not use the HTTP response to set `APPROVED`; only the RabbitMQ consumer updates order status.

This keeps ownership clear: the HTTP request initiates work, while the event synchronizes the payment fact.

### Preserve a pending order when HTTP dispatch fails

The payment HTTP client uses a short explicit timeout. If payments-service is unreachable, times out, or returns an unsuccessful response, orders-service keeps the persisted order as `PENDING`, logs the failure, and returns HTTP `502` with the `orderId`.

Deleting the order on failure was considered but rejected because it would hide partial degradation. Automatic retry is deferred to a later resilience slice.

### Publish one payment domain event

Payments-service publishes one persistent message to a direct exchange:

```json
{
  "eventType": "payment.approved",
  "paymentId": 1,
  "orderId": 1,
  "status": "APPROVED",
  "occurredAt": "2026-06-01T12:00:00.000Z"
}
```

The direct exchange uses routing key `payment.approved`. Orders-service binds a durable queue named `orders.payment-status`; notifications-service binds its own durable queue named `email.notifications`.

Publishing both an order message and an email command was considered but rejected because payments-service should publish the business fact once rather than know each consumer's message format.

### Make consumers idempotent and explicit about bad messages

Orders-service sets the matching order payment status to `APPROVED`. Reprocessing the same event is harmless. Invalid events and events for missing orders are logged and discarded. Transient database failures are requeued.

Notifications-service validates the domain event, builds the existing kitchen email internally, and acknowledges the message only after email sending succeeds.

## Risks / Trade-offs

- [A payment HTTP failure leaves an order pending without automatic recovery] -> Return a visible `502`, preserve the `orderId`, and add retry behavior in a later resilience change if required.
- [RabbitMQ delivery is at least once] -> Make the order status update idempotent.
- [A service can miss events if its queue has never been declared] -> Start the orders consumer before accepting HTTP traffic and keep queues durable.
- [A client can modify an order while mock payment processing is in flight] -> Leave this behavior explicit and address order mutability in a separate domain-rule change if needed.

## Migration Plan

1. Add RabbitMQ configuration and dependency to orders-service.
2. Change payments-service to publish `payment.approved` domain events.
3. Adapt notifications-service to consume the new payload.
4. Add the orders-service consumer and start it before the HTTP server listens.
5. Add the payments-service HTTP client and invoke it after order insertion.
6. Update Compose configuration and documentation.

Rollback requires deploying the previous payments publisher and notifications consumer together because the RabbitMQ payload contract changes.

## Open Questions

- Automatic retry of pending payment requests is intentionally deferred. A later change can add a dedicated retry endpoint or controlled background retry after the basic flow is measured.
