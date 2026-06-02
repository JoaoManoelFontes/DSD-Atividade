## 1. Payment Approval Event Contract

- [x] 1.1 Replace the payments-service email-specific publisher payload with a persistent `payment.approved` domain event
- [x] 1.2 Configure the payment event exchange and `payment.approved` routing key
- [x] 1.3 Adapt notifications-service to consume the payment event and build the kitchen email internally

## 2. Orders Payment Initiation

- [x] 2.1 Add payments-service URL and explicit HTTP timeout configuration to orders-service
- [x] 2.2 Add a small payments-service HTTP client for `POST /payments`
- [x] 2.3 Request payment processing only after persisting a new order as `PENDING`
- [x] 2.4 Preserve the pending order, log the failure, and return `502` with `orderId` when payment initiation fails

## 3. Orders Payment Status Consumer

- [x] 3.1 Add RabbitMQ dependency and configuration to orders-service
- [x] 3.2 Add an orders-service consumer with durable `orders.payment-status` queue binding
- [x] 3.3 Validate `payment.approved` payloads and idempotently update matching orders to `APPROVED`
- [x] 3.4 Start the orders consumer before accepting HTTP traffic and close it during shutdown

## 4. Runtime Configuration and Documentation

- [x] 4.1 Connect orders-service to the RabbitMQ network and document required environment variables
- [x] 4.2 Update service READMEs with the HTTP initiation and asynchronous status flow

## 5. Verification

- [x] 5.1 Build orders-service, payments-service, and notifications-service
- [x] 5.2 Validate Compose configuration for the three affected services
- [x] 5.3 Run the happy-path experiment: create an order, observe the payment request, and confirm the order eventually becomes `APPROVED`
- [x] 5.4 Run the degradation experiment: stop payments-service, create an order, and confirm the persisted order remains `PENDING`
- [x] 5.5 Validate the OpenSpec change in strict mode
