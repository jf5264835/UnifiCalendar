# UniFi Calendar Orchestrator

## Purpose
UniFi Calendar Orchestrator is an internal scheduling and approval system that bridges Google Calendar events to UniFi Access unlock schedules using holiday dates and holiday time windows.

## Core Goals
- Import events from multiple Google Calendars.
- Require manual approval before events affect door unlock schedules.
- Support many-to-many mapping between calendars and UniFi schedules.
- Handle Google event changes/deletes safely by invalidating approvals.
- Aggregate approved events into day-level windows per UniFi schedule.
- Provide clear audit logs and operational visibility.

## Non-Goals
- Replacing Google Calendar as the system of record for room booking.
- Replacing UniFi as the system of record for door/schedule assignments.
- Building complex, multi-stage approval workflows.

## Primary Users
- Facilities/Security Admins
- Operations staff (approvers)
- IT admins (integration/configuration)

## High-Level Workflow
1. Google Calendar sync imports events to the local database.
2. Imported events are marked pending and shown in the approval queue.
3. A user approves/denies events.
4. Approved events are mapped to one or more UniFi schedules.
5. The sync worker computes day-level time windows and pushes holiday updates to UniFi.
6. Failures and state changes are logged and surfaced in notifications/audit logs.
