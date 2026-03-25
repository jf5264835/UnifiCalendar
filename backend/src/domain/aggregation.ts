import type { TimeWindow } from "./types";

/**
 * Merge overlapping/touching windows while preserving disjoint windows.
 *
 * Example:
 * - [09:00-10:30] + [10:00-11:00] => [09:00-11:00]
 * - [09:00-10:00] + [13:00-14:00] => two windows
 */
export function mergeWindows(windows: TimeWindow[]): TimeWindow[] {
  if (windows.length === 0) {
    return [];
  }

  const sorted = [...windows].sort((a, b) => {
    if (a.start < b.start) return -1;
    if (a.start > b.start) return 1;
    return a.end.localeCompare(b.end);
  });

  const merged: TimeWindow[] = [{ ...sorted[0] }];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      if (current.end > last.end) {
        last.end = current.end;
      }
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}
