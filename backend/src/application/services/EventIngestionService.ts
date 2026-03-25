import { transition } from "../../domain/stateMachine";
import type { ManagedEvent } from "../../domain/entities";
import type { GoogleCalendarEvent } from "../../integrations/google/types";
import { InMemoryStore } from "../../repositories/InMemoryStore";

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

export class EventIngestionService {
  constructor(private readonly store: InMemoryStore) {}

  upsertGoogleEvent(googleEvent: GoogleCalendarEvent, nowIso: string): ManagedEvent {
    const id = `google:${googleEvent.calendarId}:${googleEvent.eventId}`;
    const mapping = this.store.mappings.get(googleEvent.calendarId);
    const versionHash = simpleHash(
      JSON.stringify({
        title: googleEvent.title,
        startAt: googleEvent.startAt,
        endAt: googleEvent.endAt,
        status: googleEvent.status,
      }),
    );

    const existing = this.store.events.get(id);

    if (googleEvent.status === "cancelled") {
      const deletedEvent: ManagedEvent = {
        ...(existing ?? {
          id,
          source: "google",
          sourceCalendarId: googleEvent.calendarId,
          sourceEventId: googleEvent.eventId,
          title: googleEvent.title,
          startAt: googleEvent.startAt,
          endAt: googleEvent.endAt,
          timezone: googleEvent.timezone,
          state: "DELETED",
          assignedScheduleIds: mapping?.scheduleIds ?? [],
          changedSinceApproval: false,
          deletedInSource: true,
          createdAt: nowIso,
          updatedAt: nowIso,
        }),
        deletedInSource: true,
        state: "DELETED",
        updatedAt: nowIso,
      };

      this.store.events.set(id, deletedEvent);
      this.store.approvals.delete(id);
      return deletedEvent;
    }

    if (!existing) {
      const created: ManagedEvent = {
        id,
        source: "google",
        sourceCalendarId: googleEvent.calendarId,
        sourceEventId: googleEvent.eventId,
        sourceVersionHash: versionHash,
        title: googleEvent.title,
        startAt: googleEvent.startAt,
        endAt: googleEvent.endAt,
        timezone: googleEvent.timezone,
        state: "IMPORTED_PENDING",
        assignedScheduleIds: mapping?.scheduleIds ?? [],
        changedSinceApproval: false,
        deletedInSource: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      this.store.events.set(id, created);
      return created;
    }

    const wasChanged = existing.sourceVersionHash !== versionHash;
    const nextState = wasChanged ? transition(existing.state, "google_changed") : existing.state;

    const updated: ManagedEvent = {
      ...existing,
      title: googleEvent.title,
      startAt: googleEvent.startAt,
      endAt: googleEvent.endAt,
      timezone: googleEvent.timezone,
      sourceVersionHash: versionHash,
      deletedInSource: false,
      changedSinceApproval: wasChanged,
      state: nextState,
      assignedScheduleIds: mapping?.scheduleIds ?? existing.assignedScheduleIds,
      updatedAt: nowIso,
    };

    if (wasChanged) {
      this.store.approvals.delete(id);
    }

    this.store.events.set(id, updated);
    return updated;
  }
}
