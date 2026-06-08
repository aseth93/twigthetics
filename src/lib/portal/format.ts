function parsePortalDateValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00.000Z`);
  }

  return new Date(value);
}

export function formatPortalDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsePortalDateValue(value));
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
  }).format(parsePortalDateValue(value));
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

export function formatWeightPounds(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Not logged";
  }

  return `${value.toFixed(1)} lb`;
}

export function formatHydrationOunces(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Not logged";
  }

  return `${value} oz`;
}

export function formatSleepHours(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Not logged";
  }

  return `${value.toFixed(1)} hr`;
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
