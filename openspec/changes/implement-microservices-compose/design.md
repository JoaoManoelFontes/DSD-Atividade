## Context

The assignment requires four independently deployable services for menu, orders, payments, and notifications. The repository does not yet contain an implementation, so this change establishes only the runtime boundaries needed for later incremental slices.

## Goals / Non-Goals

**Goals:**

- Create four independent TypeScript and Fastify services.
- Give each service its own dependencies, environment configuration, container image, port, and `/health` endpoint.
- Allow all services to start together with Docker Compose.
- Keep the structure easy to understand for an academic comparison.

**Non-Goals:**

- Implement domain rules or persistence.
- Add PostgreSQL or RabbitMQ.
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

## Risks / Trade-offs

- [Duplicated setup files across services] -> Keep the files intentionally small; shared packages can be evaluated only if real duplication becomes costly.
- [Committed local `.env` files can encourage secrets in source control] -> Use placeholder development-only values and ignore future `.env` changes through `.gitignore`.
- [No databases or messaging yet] -> Add them in separate OpenSpec changes so each architectural step remains verifiable.
