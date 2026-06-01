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

### Requirement: Compose orchestration
The system SHALL provide a Docker Compose file that builds, starts, and health-checks the four services.

#### Scenario: Start the microservices setup
- **WHEN** a developer runs `docker compose up --build`
- **THEN** Docker Compose builds and starts the four services on distinct host ports
