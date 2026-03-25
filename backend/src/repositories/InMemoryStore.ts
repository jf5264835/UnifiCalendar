import type {
  ApprovalRecord,
  AuditLogEntry,
  CalendarScheduleMapping,
  ManagedEvent,
  QueueItem,
  SystemSettings,
} from "../domain/entities";

export class InMemoryStore {
  public readonly events = new Map<string, ManagedEvent>();
  public readonly approvals = new Map<string, ApprovalRecord>();
  public readonly mappings = new Map<string, CalendarScheduleMapping>();
  public readonly queue = new Map<string, QueueItem>();
  public readonly audits: AuditLogEntry[] = [];

  public settings: SystemSettings = {
    timezone: "UTC",
    branding: {
      appName: "UniFi Calendar Orchestrator",
      primaryColor: "#0F4C81",
    },
    notifications: {
      smtpEnabled: false,
      webhooks: [],
    },
  };
}
