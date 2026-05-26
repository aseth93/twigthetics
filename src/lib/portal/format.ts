export function formatPortalDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatPortalDateTime(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatBytes(value?: number | null) {
  if (!value) {
    return "Size unavailable";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatRoleLabel(role: string) {
  return role === "coach_admin" ? "Coach Admin" : "Member";
}

export function getStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (["active", "paid", "sent"].includes(normalized)) {
    return "positive";
  }

  if (["trialing", "pending", "draft"].includes(normalized)) {
    return "neutral";
  }

  return "negative";
}
