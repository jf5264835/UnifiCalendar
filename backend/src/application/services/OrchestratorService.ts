import { AggregationService } from "./AggregationService";
import { SyncQueueService } from "./SyncQueueService";
import { InMemoryStore } from "../../repositories/InMemoryStore";
import type { NotificationService } from "../../integrations/notifications/NotificationService";
import type { UniFiAccessClient } from "../../integrations/unifi/UniFiAccessClient";

export class OrchestratorService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly aggregationService: AggregationService,
    private readonly queueService: SyncQueueService,
    private readonly unifiClient: UniFiAccessClient,
    private readonly notifications: NotificationService,
  ) {}

  buildAndQueuePlans(nowIso: string): number {
    const events = [...this.store.events.values()];
    const plans = this.aggregationService.buildPlans(events);

    for (const plan of plans) {
      this.queueService.enqueueUpsert(plan, nowIso);
    }

    return plans.length;
  }

  async processNext(nowIso: string): Promise<boolean> {
    const item = this.queueService.nextPending();
    if (!item) return false;

    this.queueService.markProcessing(item.id, nowIso);

    try {
      await this.unifiClient.upsertHolidayScheduleDay(item.payload);
      this.queueService.markCompleted(item.id, new Date().toISOString());
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sync error";
      this.queueService.markFailed(item.id, message, new Date().toISOString());
      await this.notifications.notifyFailure("UniFi sync failed", `${item.dedupeKey}: ${message}`);
      return false;
    }
  }
}
