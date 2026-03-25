# UniFi Calendar Orchestrator

Production-oriented MVP backend for ingesting Google Calendar events, applying manual approvals, aggregating schedule windows, and pushing schedule-day plans to UniFi Access.

## What is implemented

- Domain lifecycle/state logic (`transition`, `mergeWindows`)
- In-memory store and service layer for:
  - ingestion
  - approvals
  - mappings
  - aggregation
  - queueing
  - orchestration
- Fastify HTTP server with runnable endpoints
- Unit/integration-style tests using Vitest

## Prerequisites

- Node.js 20+
- npm 10+

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

3. Health check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok"}
```

## Build + Run (production mode)

```bash
npm run build
npm start
```

## Typecheck + Test

```bash
npm run typecheck
npm test
```

## API examples

### Set calendar-to-schedule mappings

```bash
curl -X PUT http://localhost:3000/api/v1/mappings/calendar-schedules/cal_auditorium \
  -H "content-type: application/json" \
  -d '{"scheduleIds":["front_door","kids_wing"]}'
```

### Upsert a Google event

```bash
curl -X POST http://localhost:3000/api/v1/google/events/upsert \
  -H "content-type: application/json" \
  -d '{
    "calendarId":"cal_auditorium",
    "eventId":"evt_100",
    "title":"Evening Program",
    "status":"confirmed",
    "updatedAt":"2026-03-25T16:00:00Z",
    "startAt":"2026-03-26T18:00:00Z",
    "endAt":"2026-03-26T20:00:00Z",
    "timezone":"America/Chicago"
  }'
```

### Approve event

```bash
curl -X POST http://localhost:3000/api/v1/events/google:cal_auditorium:evt_100/approve \
  -H "content-type: application/json" \
  -d '{"actorId":"admin_1","reason":"validated"}'
```

### Build queue plans and process one item

```bash
curl -X POST http://localhost:3000/api/v1/sync/run-now
curl -X POST http://localhost:3000/api/v1/sync/process-next
curl http://localhost:3000/api/v1/sync/queue
```

## Notes

- This version uses in-memory storage and in-memory UniFi adapters for deterministic local testing.
- To make it fully production-ready, next steps are PostgreSQL repositories, auth/session integration, real Google API client, and real UniFi Access API client wiring.
