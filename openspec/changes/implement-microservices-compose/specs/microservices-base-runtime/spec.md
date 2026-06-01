## ADDED Requirements

### Requirement: Independent microservice processes
The system SHALL provide independent runtime processes for orders, menu, payments, and notifications.

#### Scenario: Start all service processes
- **WHEN** the microservices Docker Compose project is started
- **THEN** orders, menu, payments, and notifications services run as separate containers

### Requirement: Isolated environment configuration
Each service SHALL load its own environment configuration and SHALL provide an example configuration file.

#### Scenario: Configure one service
- **WHEN** a developer opens a service directory
- **THEN** that directory contains `.env` and `.env.example` files with the service host and port variables

### Requirement: Service health endpoint
Each service SHALL expose an HTTP `GET /health` endpoint that identifies the service and reports an operational status.

#### Scenario: Check service health
- **WHEN** a client sends `GET /health` to any service
- **THEN** the service responds with HTTP 200 and a body containing `status: "ok"` and its service name

### Requirement: Independent Compose orchestration
Each service SHALL provide its own Docker Compose file that builds, starts, and health-checks that service without starting the other application services.

#### Scenario: Start one microservice stack
- **WHEN** a developer runs `docker compose up --build` inside a service directory
- **THEN** Docker Compose builds and starts only that application service and its local infrastructure

### Requirement: Isolated PostgreSQL containers
Each service SHALL provide its own PostgreSQL container and SHALL NOT share its database container with another application service.

#### Scenario: Start a service database
- **WHEN** a developer starts any service stack
- **THEN** Docker Compose starts a PostgreSQL container dedicated to that service

### Requirement: Shared RabbitMQ broker
The notifications stack SHALL provide one RabbitMQ broker that can be shared by future event publishers and notification consumers.

#### Scenario: Start notifications infrastructure
- **WHEN** a developer starts the notifications stack
- **THEN** Docker Compose starts the notifications application, its isolated PostgreSQL container, and one RabbitMQ broker
