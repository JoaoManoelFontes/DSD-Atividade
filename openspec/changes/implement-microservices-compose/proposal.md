## Why

The microservices version needs an executable foundation before domain logic, databases, and messaging are introduced. Creating isolated Fastify services now makes the deployment boundaries explicit and gives each capability an independently verifiable health endpoint.

## What Changes

- Add four independent TypeScript and Fastify applications: orders, menu, payments, and notifications.
- Add isolated environment configuration files for each service.
- Add a Dockerfile for each service.
- Add an independent Docker Compose file for each service.
- Add one isolated PostgreSQL container to each service stack.
- Add one shared RabbitMQ broker to the notifications stack for later asynchronous integration.
- Add a health check endpoint to every service.
- Add initial run instructions for the microservices version.

## Capabilities

### New Capabilities

- `microservices-base-runtime`: Independent service processes, environment configuration, Compose orchestration, and health checks.

### Modified Capabilities

None.

## Impact

- Adds the initial implementation under `microservice/`.
- Adds Node.js, TypeScript, Fastify, PostgreSQL, RabbitMQ, and Docker Compose configuration.
- Exposes HTTP ports `3001`, `3002`, `3003`, and `3004`.
- Does not yet introduce database access, RabbitMQ application integration, or domain endpoints.
