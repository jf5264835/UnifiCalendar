import Fastify, { FastifyInstance } from "fastify";
import { AggregationService } from "./application/services/AggregationService";
import { ApprovalService } from "./application/services/ApprovalService";
import { EventIngestionService } from "./application/services/EventIngestionService";
import { MappingService } from "./application/services/MappingService";
import { OrchestratorService } from "./application/services/OrchestratorService";
import { SettingsService } from "./application/services/SettingsService";
import { SyncQueueService } from "./application/services/SyncQueueService";
import { InMemoryUniFiAccessClient } from "./integrations/unifi/UniFiAccessClient";
import { NoopNotificationService } from "./integrations/notifications/NotificationService";
import { InMemoryStore } from "./repositories/InMemoryStore";
import type { GoogleCalendarEvent } from "./integrations/google/types";

export interface AppContext {
  store: InMemoryStore;
  settingsService: SettingsService;
  mappingService: MappingService;
  eventIngestionService: EventIngestionService;
  approvalService: ApprovalService;
  aggregationService: AggregationService;
  syncQueueService: SyncQueueService;
  orchestratorService: OrchestratorService;
  unifiClient: InMemoryUniFiAccessClient;
}

export function buildApp(context?: Partial<AppContext>): FastifyInstance {
  const store = context?.store ?? new InMemoryStore();
  const settingsService = context?.settingsService ?? new SettingsService(store);
  const mappingService = context?.mappingService ?? new MappingService(store);
  const eventIngestionService = context?.eventIngestionService ?? new EventIngestionService(store);
  const approvalService = context?.approvalService ?? new ApprovalService(store);
  const aggregationService = context?.aggregationService ?? new AggregationService();
  const syncQueueService = context?.syncQueueService ?? new SyncQueueService(store);
  const unifiClient = context?.unifiClient ?? new InMemoryUniFiAccessClient();
  const orchestratorService =
    context?.orchestratorService ??
    new OrchestratorService(store, aggregationService, syncQueueService, unifiClient, new NoopNotificationService());

  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ status: "ok" }));

  app.get("/api/v1/settings/system", async () => settingsService.getSettings());
  app.patch<{ Body: Record<string, unknown> }>("/api/v1/settings/system", async (request) => {
    return settingsService.updateSettings(request.body);
  });

  app.get("/api/v1/mappings/calendar-schedules", async () => mappingService.getAllMappings());
  app.put<{ Params: { calendarId: string }; Body: { scheduleIds: string[] } }>(
    "/api/v1/mappings/calendar-schedules/:calendarId",
    async (request) => {
      return mappingService.setCalendarMappings(request.params.calendarId, request.body.scheduleIds);
    },
  );

  app.post<{ Body: GoogleCalendarEvent }>("/api/v1/google/events/upsert", async (request) => {
    return eventIngestionService.upsertGoogleEvent(request.body, new Date().toISOString());
  });

  app.post<{ Params: { eventId: string }; Body: { actorId: string; reason?: string } }>(
    "/api/v1/events/:eventId/approve",
    async (request) => approvalService.approveEvent(request.params.eventId, request.body.actorId, request.body.reason),
  );

  app.post<{ Params: { eventId: string }; Body: { actorId: string; reason?: string } }>(
    "/api/v1/events/:eventId/deny",
    async (request) => approvalService.denyEvent(request.params.eventId, request.body.actorId, request.body.reason),
  );

  app.post<{ Params: { eventId: string }; Body: { actorId: string; reason?: string } }>(
    "/api/v1/events/:eventId/unapprove",
    async (request) => approvalService.unapproveEvent(request.params.eventId, request.body.actorId, request.body.reason),
  );

  app.post("/api/v1/sync/run-now", async () => {
    const count = orchestratorService.buildAndQueuePlans(new Date().toISOString());
    return { queuedPlans: count };
  });

  app.post("/api/v1/sync/process-next", async () => {
    const processed = await orchestratorService.processNext(new Date().toISOString());
    return { processed };
  });

  app.get("/api/v1/sync/queue", async () => [...store.queue.values()]);
  app.get("/api/v1/events", async () => [...store.events.values()]);

  return app;
}
