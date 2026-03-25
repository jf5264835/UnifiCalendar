# API Contract (v1)

Base URL: `/api/v1`

## Auth
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

## Users (admin)
- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

## System Settings
- `GET /settings/system`
- `PATCH /settings/system`
- `GET /settings/notifications`
- `PATCH /settings/notifications`

## Integrations: Google
- `GET /integrations/google/status`
- `POST /integrations/google/connect`
- `POST /integrations/google/disconnect`
- `GET /google/calendars`
- `POST /google/calendars/:calendarId/enable`
- `POST /google/calendars/:calendarId/disable`
- `POST /google/sync` (admin)

## Integrations: UniFi
- `GET /integrations/unifi/status`
- `PATCH /integrations/unifi/config`
- `POST /unifi/schedules/refresh`
- `GET /unifi/schedules`

## Mapping
- `GET /mappings/calendar-schedules`
- `PUT /mappings/calendar-schedules/:calendarId`

## Events + Approval
- `GET /events`
- `POST /events/local`
- `PATCH /events/:id/local`
- `DELETE /events/:id/local`
- `POST /events/:id/approve`
- `POST /events/:id/deny`
- `POST /events/:id/unapprove`

## Sync + Queue
- `GET /sync/queue`
- `GET /sync/runs`
- `POST /sync/run-now` (admin)
- `POST /sync/retry/:queueItemId` (admin)

## Audit + Health
- `GET /audit`
- `GET /health`
- `GET /health/dependencies`
