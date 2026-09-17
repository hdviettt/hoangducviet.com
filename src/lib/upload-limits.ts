/**
 * One definition of how big an upload may be, shared by the browser and the
 * API route.
 *
 * It has to be shared, because the two ends failing to agree is what made an
 * oversized upload hang instead of fail. The route rejects on `content-length`
 * before it reads the body; a browser that does not know the limit is still
 * streaming when that reply comes back, nothing ever drains what it is
 * sending, and `fetch()` never settles. The picker's button then sits on
 * "Uploading…" forever, because the `finally` that clears it never runs.
 *
 * Measured against production before the fix: a 55 MB file held the button on
 * "Uploading…" for more than five minutes with the request never completing,
 * while the same file through curl came back 413 in two seconds after sending
 * 1.2 MB. curl notices the early reply and stops; the browser does not.
 *
 * So the browser checks first and never sends a file it knows will be refused,
 * and the route drains the body before answering for anything that still
 * arrives oversized.
 */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/** What the route tolerates over the limit for multipart framing overhead. */
export const UPLOAD_SLACK_BYTES = 1024 * 1024;

export const MAX_UPLOAD_LABEL = "50 MB";

export function tooLarge(bytes: number): boolean {
  return bytes > MAX_UPLOAD_BYTES;
}

/** "62.4 MB" — for telling someone how far over they are. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
