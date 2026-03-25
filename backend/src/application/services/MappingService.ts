import type { CalendarScheduleMapping } from "../../domain/entities";
import { InMemoryStore } from "../../repositories/InMemoryStore";

export class MappingService {
  constructor(private readonly store: InMemoryStore) {}

  setCalendarMappings(calendarId: string, scheduleIds: string[]): CalendarScheduleMapping {
    const mapping: CalendarScheduleMapping = {
      calendarId,
      scheduleIds: [...new Set(scheduleIds)],
    };

    this.store.mappings.set(calendarId, mapping);
    return mapping;
  }

  getCalendarMappings(calendarId: string): CalendarScheduleMapping | undefined {
    return this.store.mappings.get(calendarId);
  }

  getAllMappings(): CalendarScheduleMapping[] {
    return [...this.store.mappings.values()];
  }
}
