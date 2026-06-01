## 1. OpenSpec Documentation

- [x] 1.1 Document the setup proposal, design, and runtime requirements

## 2. Service Setup

- [x] 2.1 Create orders-service with TypeScript, Fastify, isolated env files, and GET /health
- [x] 2.2 Create menu-service with TypeScript, Fastify, isolated env files, and GET /health
- [x] 2.3 Create payments-service with TypeScript, Fastify, isolated env files, and GET /health
- [x] 2.4 Create notifications-service with TypeScript, Fastify, isolated env files, and GET /health

## 3. Container Orchestration

- [x] 3.1 Add one Dockerfile per service
- [x] 3.2 Add an independent Docker Compose file to each service with distinct ports and health checks
- [x] 3.3 Add one isolated PostgreSQL container to each service stack
- [x] 3.4 Add one shared RabbitMQ broker to the notifications stack

## 4. Documentation and Verification

- [x] 4.1 Add microservices README with local and Docker Compose commands
- [x] 4.2 Validate the OpenSpec change
- [x] 4.3 Install dependencies and verify TypeScript builds
- [x] 4.4 Verify the Docker Compose configuration
