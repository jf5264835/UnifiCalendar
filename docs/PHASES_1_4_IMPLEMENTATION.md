# Phase 1-4 Implementation Write-Up

This document maps the planned implementation phases to the code currently present in `backend/src`.

## Scope Assumption
The API contract in `docs/API_CONTRACT.md` is accepted as baseline for now and is not revised in this phase package.

## Phase 1: Foundation

Implemented primitives:
- Core domain entities and enums (`entities.ts`).
- Settings model and service for system/notification/branding config (`SettingsService.ts`).
- In-memory repository abstraction that can be replaced with persistent storage later (`InMemoryStore.ts`).

Outcome:
- Provides deterministic, testable stateful foundation for future DB-backed persistence.

## Phase 2: Calendar Ingestion

Implemented primitives:
- Google event DTO and normalized model mapping (`integrations/google/types.ts`).
- Ingestion service that upserts events from Google, tracks content hash, and marks changed/deleted behavior (`EventIngestionService.ts`).

Rules implemented:
- Changed Google event invalidates approval and marks event as changed-review-required.
- Deleted Google event is marked deleted and approval is removed.

## Phase 3: Approval + Mapping

Implemented primitives:
- Calendar <-> schedule many-to-many mapping service (`MappingService.ts`).
- Approval service for approve/deny/unapprove with audit entries (`ApprovalService.ts`).

Rules implemented:
- Approve/deny/unapprove transitions use the domain state machine.
- All actions append audit log entries.

## Phase 4: UniFi Schedule Orchestration

Implemented primitives:
- Aggregation service to build per-schedule, per-day windows from approved events (`AggregationService.ts`).
- Queue service with enqueue/retry/complete/fail mechanics (`SyncQueueService.ts`).
- UniFi client interface + in-memory mock adapter (`UniFiAccessClient.ts`).
- Orchestrator service that composes aggregation + queue + UniFi writes (`OrchestratorService.ts`).

Rules implemented:
- Overlapping windows are merged.
- Disjoint windows are preserved.
- Sync items are queued and executed idempotently by item key (`scheduleId:date`).

## What remains (post Phase 1-4 package)

1. Replace in-memory store with PostgreSQL repositories.
2. Add worker runtime (cron + queue consumers).
3. Add auth/session, controllers, and HTTP handlers.
4. Wire real Google and UniFi clients (currently interfaces/mock).
5. Add comprehensive test coverage and CI.
