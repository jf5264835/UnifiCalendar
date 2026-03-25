import type { EventAction, EventState } from "./types";

/**
 * Pure transition function for lifecycle management of imported/local events.
 */
export function transition(current: EventState, action: EventAction): EventState {
  if (action === "google_deleted") {
    return "DELETED";
  }

  if (action === "google_changed") {
    return "CHANGED_REVIEW_REQUIRED";
  }

  switch (current) {
    case "IMPORTED_PENDING":
    case "CHANGED_REVIEW_REQUIRED":
      if (action === "approve") return "APPROVED_QUEUED";
      if (action === "deny") return "DENIED";
      return current;

    case "APPROVED_QUEUED":
      if (action === "sync_success") return "SYNCED";
      if (action === "sync_fail") return "SYNC_FAILED";
      if (action === "unapprove") return "IMPORTED_PENDING";
      return current;

    case "SYNCED":
    case "SYNC_FAILED":
      if (action === "unapprove") return "IMPORTED_PENDING";
      return current;

    case "DENIED":
    case "DELETED":
      return current;

    default:
      return current;
  }
}
