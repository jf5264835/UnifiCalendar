import type { QueueItem, ScheduleDayPlan } from "../../domain/entities";
import { InMemoryStore } from "../../repositories/InMemoryStore";

export class SyncQueueService {
  constructor(private readonly store: InMemoryStore) {}

  enqueueUpsert(plan: ScheduleDayPlan, nowIso: string): QueueItem {
    const dedupeKey = `${plan.scheduleId}:${plan.date}`;
    const existing = [...this.store.queue.values()].find((item) => item.dedupeKey === dedupeKey && item.status !== "completed");

    if (existing) {
      existing.payload = plan;
      existing.updatedAt = nowIso;
      return existing;
    }

    const item: QueueItem = {
      id: `queue:${Date.now()}:${Math.random().toString(16).slice(2)}`,
      type: "upsert_schedule_day",
      dedupeKey,
      payload: plan,
      status: "pending",
      attempts: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.store.queue.set(item.id, item);
    return item;
  }

  nextPending(): QueueItem | undefined {
    return [...this.store.queue.values()].find((item) => item.status === "pending");
  }

  markProcessing(itemId: string, nowIso: string): void {
    const item = this.requireItem(itemId);
    item.status = "processing";
    item.updatedAt = nowIso;
  }

  markCompleted(itemId: string, nowIso: string): void {
    const item = this.requireItem(itemId);
    item.status = "completed";
    item.updatedAt = nowIso;
  }

  markFailed(itemId: string, error: string, nowIso: string): void {
    const item = this.requireItem(itemId);
    item.status = "failed";
    item.attempts += 1;
    item.lastError = error;
    item.updatedAt = nowIso;
  }

  retry(itemId: string, nowIso: string): void {
    const item = this.requireItem(itemId);
    item.status = "pending";
    item.updatedAt = nowIso;
  }

  private requireItem(itemId: string): QueueItem {
    const item = this.store.queue.get(itemId);
    if (!item) {
      throw new Error(`Queue item not found: ${itemId}`);
    }
    return item;
  }
}
