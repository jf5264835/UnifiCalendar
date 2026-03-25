# Event State Machine

## States
- `IMPORTED_PENDING`
- `APPROVED_QUEUED`
- `SYNCED`
- `SYNC_FAILED`
- `DENIED`
- `CHANGED_REVIEW_REQUIRED`
- `DELETED`

## Transitions
- `approve`: `IMPORTED_PENDING | CHANGED_REVIEW_REQUIRED -> APPROVED_QUEUED`
- `deny`: `IMPORTED_PENDING | CHANGED_REVIEW_REQUIRED -> DENIED`
- `sync_success`: `APPROVED_QUEUED -> SYNCED`
- `sync_fail`: `APPROVED_QUEUED -> SYNC_FAILED`
- `unapprove`: `APPROVED_QUEUED | SYNCED | SYNC_FAILED -> IMPORTED_PENDING`
- `google_changed`: `any active state -> CHANGED_REVIEW_REQUIRED`
- `google_deleted`: `any active state -> DELETED`

## Transition Rules
1. `google_changed` always clears approval metadata.
2. `google_deleted` always clears approval metadata and pending queue operations.
3. `unapprove` enqueues reconciliation to remove UniFi effects.
4. Only approved events are eligible for UniFi sync.
