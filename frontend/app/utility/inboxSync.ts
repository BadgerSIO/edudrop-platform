export type InboxEndpoint = "submissions" | "school-inbox";

export const INBOX_UPDATED_EVENT = "edudrop:inbox-updated";

const getDirtyKey = (endpoint: InboxEndpoint) =>
  `edudrop:inbox-dirty:${endpoint}`;

export function markInboxDirty(endpoint: InboxEndpoint): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(getDirtyKey(endpoint), "1");
  } catch {
    // Ignore storage access errors in restricted browsing modes
  }
}

export function consumeInboxDirty(endpoint: InboxEndpoint): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = getDirtyKey(endpoint);
    const isDirty = window.sessionStorage.getItem(key) === "1";
    if (isDirty) {
      window.sessionStorage.removeItem(key);
    }
    return isDirty;
  } catch {
    return false;
  }
}

export function emitInboxUpdated(
  endpoint: InboxEndpoint,
  unreadCount?: number
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(INBOX_UPDATED_EVENT, {
      detail: { endpoint, unreadCount },
    })
  );
}
