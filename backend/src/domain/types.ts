export type EventState =
  | "IMPORTED_PENDING"
  | "APPROVED_QUEUED"
  | "SYNCED"
  | "SYNC_FAILED"
  | "DENIED"
  | "CHANGED_REVIEW_REQUIRED"
  | "DELETED";

export type EventAction =
  | "approve"
  | "deny"
  | "sync_success"
  | "sync_fail"
  | "unapprove"
  | "google_changed"
  | "google_deleted";

export type TimeWindow = {
  /**
   * ISO local datetime (or pre-normalized comparable key).
   */
  start: string;
  /**
   * ISO local datetime (or pre-normalized comparable key).
   */
  end: string;
};
