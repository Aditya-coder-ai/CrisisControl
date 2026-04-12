# High-Level Architecture (The Blueprint)

## Tier 1: Input Layer (Edge)
- **Clients**: Mobile emergency responders, generic staff web dashboard, public guest portal.
- **Pattern**: Offline-First. Clients store mutations locally if disconnected and batch them to Tier 2 when connectivity is restored.

## Tier 2: Synchronization & Processing Layer (Core API)
- **Compute**: Stateless Go backend.
- **Ingress**: Reverse proxy/load balancer routing to standard library multiplexer.
- **Key Services**:
  - `SyncService`: Accepts arrays of offline interactions, extracts metadata, verifies timestamps and enforces idempotency.
  - `RBAC Middleware`: Intercepts events based on context bounds preventing strict horizontal escalation.
  
## Tier 3: Storage & Output Layer
- **Relational Stores**: PostgreSQL or CockroachDB (recommended for true resilience) handling ACID transactions.
- **Caching/PubSub**: Redis for broadcasting changes (StatusUpdate channels) via WebSocket connections back to Tier 1 clients.
