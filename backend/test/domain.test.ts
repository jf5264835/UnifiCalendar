import { describe, expect, it } from "vitest";
import { mergeWindows } from "../src/domain/aggregation";
import { transition } from "../src/domain/stateMachine";

describe("mergeWindows", () => {
  it("merges overlapping windows", () => {
    const merged = mergeWindows([
      { start: "2026-03-26T09:00:00Z", end: "2026-03-26T10:30:00Z" },
      { start: "2026-03-26T10:00:00Z", end: "2026-03-26T11:00:00Z" },
    ]);

    expect(merged).toEqual([{ start: "2026-03-26T09:00:00Z", end: "2026-03-26T11:00:00Z" }]);
  });

  it("preserves disjoint windows", () => {
    const merged = mergeWindows([
      { start: "2026-03-26T09:00:00Z", end: "2026-03-26T10:00:00Z" },
      { start: "2026-03-26T13:00:00Z", end: "2026-03-26T14:00:00Z" },
    ]);

    expect(merged).toEqual([
      { start: "2026-03-26T09:00:00Z", end: "2026-03-26T10:00:00Z" },
      { start: "2026-03-26T13:00:00Z", end: "2026-03-26T14:00:00Z" },
    ]);
  });
});

describe("transition", () => {
  it("moves pending to approved on approve", () => {
    expect(transition("IMPORTED_PENDING", "approve")).toBe("APPROVED_QUEUED");
  });

  it("always moves to DELETED on google_deleted", () => {
    expect(transition("SYNCED", "google_deleted")).toBe("DELETED");
  });
});
