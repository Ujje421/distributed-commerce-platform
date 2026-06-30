# CommerceFlow: Event-Driven E-Commerce Platform

A production-grade, highly scalable e-commerce microservices ecosystem inspired by modern cloud-native architectures (like Amazon). Built to demonstrate distributed systems expertise, event-driven design, and AI integration.

## 🌟 Architecture Highlights

- **Microservices Architecture**: 9 distinct microservices logically separated by bounded contexts.
- **Event-Driven & Choreographed Sagas**: Uses Kafka to choreograph asynchronous tasks. Implements a central Saga Orchestrator in the Order Service to manage complex distributed checkout flows.
- **Transactional Outbox Pattern**: Guarantees "at-least-once" message delivery across database boundaries without two-phase commit (2PC).
- **Event Sourcing & CQRS**: The Order service stores an immutable append-only event log (`order_events`) rather than just the current state.
- **Optimistic Locking**: The Inventory service processes high-concurrency stock reservations using versioning to prevent deadlocks.
- **Polyglot Stack**: High-performance Node.js/NestJS for I/O bound core services, and Python/FastAPI for AI/ML tasks.
- **AI Integration**: Custom TF-IDF vectorization recommendation engine powered by `scikit-learn` that synchronizes continuously with the catalog via Kafka.
- **High-Performance Search**: OpenSearch integration with edge n-gram tokenization for instant autocomplete.

---

## 🏗️ Services Overview

| Service | Stack | Port | Responsibilities |
|---------|-------|------|------------------|
| **API Gateway** | NestJS | `3000` | Edge routing, JWT validation, header propagation, rate limiting. |
| **Identity Service** | NestJS, Postgres, Redis | `3001` | OAuth, JWT issuing, Auth guards, session management. |
| **User Service** | NestJS, Postgres | `3002` | Profile management, addresses, preferences. |
| **Product Catalog** | NestJS, Postgres, OpenSearch | `3003` | Product aggregates, variants, categories, high-speed search index. |
| **Inventory Service** | NestJS, Postgres | `3004` | Optimistic locking stock reservations. |
| **Cart Service** | NestJS, Redis | `3005` | Ephemeral stateless cart caching, guest to user cart merges. |
| **Order Service** | NestJS, Postgres | `3006` | Event Sourcing, Saga Orchestrator for checkout flow. |
| **Payment Service** | NestJS, Postgres | `3007` | Mock Stripe integration, idempotency handling. |
| **Shipping Service** | NestJS, Postgres | `3008` | Automated tracking code provisioning and fulfillment. |
| **Recommendation Engine** | FastAPI, Python | `3011` | Scikit-learn similarity matching, real-time Kafka catalog syncing. |
| **Notification Service** | NestJS, Postgres | `3009` | Asynchronous email/push dispatching via Kafka events. |

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 22+ (for local development outside of Docker)
- Python 3.11+ (for AI service development)

### Running the Entire Platform
The entire ecosystem, including infrastructure (Kafka, Postgres, Redis, OpenSearch, etc.) and all microservices, can be started with a single command:

```bash
docker-compose up --build -d
```

### Infrastructure Details
The `docker-compose.infra.yml` provisions the following backbone:
- **Postgres**: Standardized relational store (each service gets its own logical database schema).
- **Kafka & Zookeeper**: Event streaming platform (`ecommerce-network:29092`).
- **Redis**: Fast caching for sessions and shopping carts.
- **OpenSearch**: Distributed search and analytics engine.
- **MinIO**: S3-compatible object storage (for product images).

---

## 🔄 The Fulfillment Saga

When a user places an order, the system executes an automated, self-healing **Saga Pattern**:
1. User posts `/orders` ➔ **Order Service** writes `PENDING` order and emits `ORDER_PLACED`.
2. **Inventory Service** receives `ORDER_PLACED` ➔ Reserves stock safely ➔ Emits `INVENTORY_RESERVED`.
3. **Order Orchestrator** updates to `PAYMENT_PROCESSING` ➔ Emits `PAYMENT_INITIATED`.
4. **Payment Service** processes payment ➔ Emits `PAYMENT_COMPLETED`.
5. **Order Orchestrator** updates to `CONFIRMED` ➔ Emits `ORDER_CONFIRMED`.
6. **Shipping Service** and **Notification Service** react to finalize fulfillment and email the user.

*If any step fails (e.g., card declined), the Orchestrator runs compensating transactions to release stock and cancel the order.*

---

## 🤖 AI Recommendation Engine
Located in `services/recommendation-service`, this Python application dynamically suggests similar products.
- Powered by `FastAPI` and `scikit-learn`.
- Uses `TfidfVectorizer` to encode product descriptions and categories.
- A background `confluent_kafka` thread listens to `PRODUCT_CREATED` events to automatically retrain the `cosine_similarity` matrix without downtime.

---

## 🛠️ Development & Monorepo

This project is a monorepo leveraging NPM workspaces.
Shared packages are located in `packages/`:
- `@ecommerce/common`: DTOs, Event Constants, Guards.
- `@ecommerce/kafka`: Centralized Kafka producer/consumer logic + Outbox Publisher.
- `@ecommerce/database`: Prisma setup and extensions.
- `@ecommerce/observability`: OpenTelemetry & Prometheus instrumentation.

To build all services locally:
```bash
npm install
npm run build --workspaces
```
