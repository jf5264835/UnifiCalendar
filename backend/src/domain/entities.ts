import type { EventState, TimeWindow } from "./types";

export type UserRole = "admin" | "operator" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
}

export interface ApprovalRecord {
  eventId: string;
  status: "approved" | "denied";
  actedBy: string;
  actedAt: string;
  reason?: string;
}

export interface CalendarScheduleMapping {
  calendarId: string;
  scheduleIds: string[];
}

export interface ManagedEvent {
  id: string;
  source: "google" | "local";
  sourceCalendarId?: string;
  sourceEventId?: string;
  sourceVersionHash?: string;
  title: string;
  startAt: string;
  endAt: string;
  timezone: string;
  state: EventState;
  assignedScheduleIds: string[];
  changedSinceApproval: boolean;
  deletedInSource: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleDayPlan {
  scheduleId: string;
  date: string;
  windows: TimeWindow[];
  eventIds: string[];
}

export interface QueueItem {
  id: string;
  type: "upsert_schedule_day";
  dedupeKey: string;
  payload: ScheduleDayPlan;
  status: "pending" | "processing" | "failed" | "completed";
  attempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: "event" | "mapping" | "sync" | "settings";
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface BrandingSettings {
  appName: string;
  primaryColor: string;
  logoUrl?: string;
}

export interface NotificationSettings {
  smtpEnabled: boolean;
  webhooks: Array<{ id: string; name: string; url: string; enabled: boolean }>;
}

export interface SystemSettings {
  timezone: string;
  branding: BrandingSettings;
  notifications: NotificationSettings;
}
