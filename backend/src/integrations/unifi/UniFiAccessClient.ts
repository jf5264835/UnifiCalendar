import type { ScheduleDayPlan } from "../../domain/entities";

export interface UniFiAccessClient {
  upsertHolidayScheduleDay(plan: ScheduleDayPlan): Promise<void>;
}

/**
 * Test/dev stub that records pushed plans in memory.
 */
export class InMemoryUniFiAccessClient implements UniFiAccessClient {
  public readonly pushed: ScheduleDayPlan[] = [];

  async upsertHolidayScheduleDay(plan: ScheduleDayPlan): Promise<void> {
    this.pushed.push(plan);
  }
}
