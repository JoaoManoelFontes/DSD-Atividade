## Context

The assignment requires four independently deployable services for menu, orders, payments, and notifications. The repository does not yet contain an implementation, so this change establishes only the runtime boundaries needed for later incremental slices.

## Goals / Non-Goals

**Goals:**

- Create four independent TypeScript and Fastify services.
- Give each service its own dependencies, environment configuration, container image, port, and `/health` endpoint.
- Allow each service and its local infrastructure to start independently with Docker Compose.
- Provide an isolated PostgreSQL container for each service.
- Provide one shared RabbitMQ broker for the later asynchronous notification flow.
- Keep the structure easy to understand for an academic comparison.

**Non-Goals:**

- Implement domain rules or persistence.
- Add database schemas, migrations, or application-level RabbitMQ integration.
- Add communication between services.
- Add shared packages, API gateways, or production-grade observability.

## Decisions

### Independent Node.js packages

Each service has its own `package.json` and TypeScript configuration. This makes the deploy boundary visible and prevents accidental coupling through shared runtime dependencies. A monorepo workspace was considered but deferred because it adds coordination mechanics that are unnecessary for the first slice.

### Environment configuration per service

Each service owns a `.env` for local defaults and a committed `.env.example` template. Docker Compose loads the corresponding file with `env_file`.

### Lightweight Fastify bootstrap

Each service uses a small `src/app.ts` factory and `src/server.ts` entrypoint. Keeping the app factory separate allows later HTTP tests without starting a network listener.

### Health checks at service and Compose levels

Every service exposes `GET /health`, and Docker Compose calls this endpoint through a Node.js health-check command. No additional operating-system packages are needed in the images.

### Independent Compose stacks

Each service directory owns a `docker-compose.yml` and its PostgreSQL container. This preserves independent deployment boundaries and allows a developer to run one capability without starting the others. A single aggregate Compose file was considered but rejected because it hides this boundary.

### One RabbitMQ broker for notification delivery

The notifications stack owns the local RabbitMQ container and exposes its AMQP port. A broker per service was considered but rejected because isolated brokers would prevent publishers and consumers from exchanging the same event.

## Risks / Trade-offs

- [Duplicated setup files across services] -> Keep the files intentionally small; shared packages can be evaluated only if real duplication becomes costly.
- [Committed local `.env` files can encourage secrets in source control] -> Use placeholder development-only values and ignore future `.env` changes through `.gitignore`.
- [The application code does not access databases or RabbitMQ yet] -> Add clients, schemas, and messaging behavior in separate OpenSpec changes.
- [Starting all stacks requires four commands] -> Document the commands; independent execution is intentional for this architecture exercise.
