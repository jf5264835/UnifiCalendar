# Architecture

## Components
1. Backend API
2. Sync Workers
3. PostgreSQL Database
4. Frontend (responsive web app)
5. Integration adapters:
   - Google Calendar
   - UniFi Access
   - SMTP/Webhook notifications

## Data Flow
1. Google sync imports/updates/deletes events into local DB.
2. Imported events enter pending or review-required states.
3. An approver explicitly approves or denies each event.
4. A worker computes date windows per schedule/day.
5. The worker pushes holiday date + time windows to UniFi.
6. Outcomes are persisted in sync runs, queue history, and audit logs.
7. Notifications are sent for failures and key lifecycle events.

## Reliability and Safety
- Idempotent queue items for UniFi writes.
- Retry with exponential backoff and terminal failure state.
- Explicit reconciliation path (admin-only "Sync now").
- Approval invalidation on Google event changes/deletes.
- Timezone-aware normalization and aggregation.

## Scalability Considerations
- Many-to-many calendar-to-schedule mappings.
- Incremental Google sync using sync tokens.
- Work queue partitioning by schedule/date.
- Cached UniFi schedule catalog with refresh endpoint.
