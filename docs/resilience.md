# Connectivity and Resilience Strategy

## Offline Mode Functionality
When a device is totally disconnected from the internet, it relies purely on local SQLite/Room/CoreData databases.
- Identifiers are pre-computed using universally unique identifiers (UUIDs) locally before hitting the server.
- The `SyncService` operates strictly on an Upsert logic matrix using UUIDs to drop double-sent requests.

## Data Persistence & Failover
- **Loss of Primary DB**: Application routing automatically falls back to secondary READ replicas while auto-scaling a new WRITE node. During a complete WRITE outage, the edge clients (Tier 1) continue pooling locally.
- **Circuit Breaking**: (To be implemented) Prevents cascading failures inside `internal/store` by returning fast errors and pausing polling.
