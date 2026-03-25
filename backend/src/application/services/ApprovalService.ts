import { transition } from "../../domain/stateMachine";
import type { ApprovalRecord, AuditLogEntry, ManagedEvent } from "../../domain/entities";
import { InMemoryStore } from "../../repositories/InMemoryStore";

function createAudit(actorId: string, action: string, entityId: string, details?: Record<string, unknown>): AuditLogEntry {
  return {
    id: `audit:${Date.now()}:${Math.random().toString(16).slice(2)}`,
    actorId,
    action,
    entityType: "event",
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };
}

export class ApprovalService {
  constructor(private readonly store: InMemoryStore) {}

  approveEvent(eventId: string, actorId: string, reason?: string): ManagedEvent {
    const event = this.requireEvent(eventId);
    event.state = transition(event.state, "approve");
    event.changedSinceApproval = false;
    event.updatedAt = new Date().toISOString();

    const approval: ApprovalRecord = {
      eventId,
      status: "approved",
      actedBy: actorId,
      actedAt: event.updatedAt,
      reason,
    };

    this.store.approvals.set(eventId, approval);
    this.store.audits.push(createAudit(actorId, "approve_event", eventId, { reason }));
    return event;
  }

  denyEvent(eventId: string, actorId: string, reason?: string): ManagedEvent {
    const event = this.requireEvent(eventId);
    event.state = transition(event.state, "deny");
    event.updatedAt = new Date().toISOString();

    const approval: ApprovalRecord = {
      eventId,
      status: "denied",
      actedBy: actorId,
      actedAt: event.updatedAt,
      reason,
    };

    this.store.approvals.set(eventId, approval);
    this.store.audits.push(createAudit(actorId, "deny_event", eventId, { reason }));
    return event;
  }

  unapproveEvent(eventId: string, actorId: string, reason?: string): ManagedEvent {
    const event = this.requireEvent(eventId);
    event.state = transition(event.state, "unapprove");
    event.updatedAt = new Date().toISOString();
    this.store.approvals.delete(eventId);
    this.store.audits.push(createAudit(actorId, "unapprove_event", eventId, { reason }));
    return event;
  }

  private requireEvent(eventId: string): ManagedEvent {
    const event = this.store.events.get(eventId);
    if (!event) {
      throw new Error(`Event not found: ${eventId}`);
    }
    return event;
  }
}
