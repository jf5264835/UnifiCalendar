import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

describe("orchestration flow", () => {
  it("ingests, approves, queues, and processes an event", async () => {
    const app = buildApp();

    await app.inject({
      method: "PUT",
      url: "/api/v1/mappings/calendar-schedules/cal_1",
      payload: { scheduleIds: ["front_door"] },
    });

    const ingest = await app.inject({
      method: "POST",
      url: "/api/v1/google/events/upsert",
      payload: {
        calendarId: "cal_1",
        eventId: "evt_1",
        title: "Test Event",
        status: "confirmed",
        updatedAt: "2026-03-25T10:00:00Z",
        startAt: "2026-03-26T18:00:00Z",
        endAt: "2026-03-26T20:00:00Z",
        timezone: "America/Chicago",
      },
    });

    expect(ingest.statusCode).toBe(200);

    const eventId = "google:cal_1:evt_1";

    const approve = await app.inject({
      method: "POST",
      url: `/api/v1/events/${encodeURIComponent(eventId)}/approve`,
      payload: { actorId: "admin_1", reason: "ok" },
    });

    expect(approve.statusCode).toBe(200);

    const runNow = await app.inject({
      method: "POST",
      url: "/api/v1/sync/run-now",
    });

    expect(runNow.statusCode).toBe(200);
    expect(runNow.json<{ queuedPlans: number }>().queuedPlans).toBe(1);

    const process = await app.inject({
      method: "POST",
      url: "/api/v1/sync/process-next",
    });

    expect(process.statusCode).toBe(200);
    expect(process.json<{ processed: boolean }>().processed).toBe(true);

    await app.close();
  });
});
