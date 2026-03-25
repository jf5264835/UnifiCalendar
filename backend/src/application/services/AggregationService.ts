import { mergeWindows } from "../../domain/aggregation";
import type { ManagedEvent, ScheduleDayPlan } from "../../domain/entities";
import type { TimeWindow } from "../../domain/types";

function extractDateKey(isoDateTime: string): string {
  return isoDateTime.slice(0, 10);
}

export class AggregationService {
  buildPlans(events: ManagedEvent[]): ScheduleDayPlan[] {
    const bucket = new Map<string, { scheduleId: string; date: string; windows: TimeWindow[]; eventIds: string[] }>();

    for (const event of events) {
      if (event.state !== "APPROVED_QUEUED" && event.state !== "SYNCED") continue;
      if (event.deletedInSource) continue;

      const date = extractDateKey(event.startAt);
      const window: TimeWindow = { start: event.startAt, end: event.endAt };

      for (const scheduleId of event.assignedScheduleIds) {
        const key = `${scheduleId}:${date}`;
        const existing = bucket.get(key);
        if (!existing) {
          bucket.set(key, {
            scheduleId,
            date,
            windows: [window],
            eventIds: [event.id],
          });
        } else {
          existing.windows.push(window);
          existing.eventIds.push(event.id);
        }
      }
    }

    return [...bucket.values()].map((entry) => ({
      scheduleId: entry.scheduleId,
      date: entry.date,
      windows: mergeWindows(entry.windows),
      eventIds: entry.eventIds,
    }));
  }
}
