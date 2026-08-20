import type {
  Classification,
  DetectionEvent,
  HardwareComponent,
  HardwareState,
  Ripeness,
  SizeGrade,
} from "./useBlightStream";

/**
 * Expected Realtime Database shape (what the Arduino / YOLO bridge should push):
 *
 * /detections/<pushId> = {
 *   id?: 412,                       // optional, falls back to insertion order
 *   label: "Healthy" | "Early Blight" | "Late Blight",
 *   confidence: 0.94 | 94,          // fraction or percent, both accepted
 *   action?: "Accepted" | "Rejected",
 *   diameterMm: 61,
 *   size?: "Small" | "Medium" | "Large",
 *   ripeness?: "Ripe" | "Unripe",
 *   timestamp: 1750000000000        // ms epoch (or ISO string)
 * }
 *
 * /hardware/<key> = { name, detail, state: "online" | "offline" | "standby" }
 */

const LABELS: Classification[] = ["Healthy", "Early Blight", "Late Blight"];

function toLabel(value: unknown): Classification {
  const raw = String(value ?? "").trim().toLowerCase();
  return LABELS.find((l) => l.toLowerCase() === raw) ?? "Healthy";
}

function toConfidence(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n <= 1 ? n * 100 : n);
}

function toSize(value: unknown, diameterMm: number): SizeGrade {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "small" || raw === "medium" || raw === "large") {
    return (raw[0]!.toUpperCase() + raw.slice(1)) as SizeGrade;
  }
  return diameterMm < 52 ? "Small" : diameterMm < 68 ? "Medium" : "Large";
}

function toTime(value: unknown): string {
  const d = typeof value === "number" ? new Date(value) : new Date(String(value ?? ""));
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  return safe.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function normalizeDetections(raw: unknown): DetectionEvent[] {
  if (!raw || typeof raw !== "object") return [];
  const entries = Array.isArray(raw)
    ? raw.map((v, i) => [String(i), v] as const)
    : Object.entries(raw as Record<string, unknown>);

  return entries
    .map(([key, value], index) => {
      const row = (value ?? {}) as Record<string, unknown>;
      const label = toLabel(row["label"] ?? row["classification"]);
      const diameterMm = Math.round(Number(row["diameterMm"] ?? row["diameter"] ?? 0)) || 0;
      const ripenessRaw = String(row["ripeness"] ?? "").trim().toLowerCase();
      const ripeness: Ripeness = ripenessRaw === "unripe" ? "Unripe" : "Ripe";
      const action =
        String(row["action"] ?? "").toLowerCase() === "rejected"
          ? "Rejected"
          : String(row["action"] ?? "").toLowerCase() === "accepted"
            ? "Accepted"
            : label === "Healthy"
              ? "Accepted"
              : "Rejected";

      return {
        sortKey: Number(row["timestamp"] ?? index),
        event: {
          id: Number(row["id"] ?? key.replace(/\D/g, "").slice(-6)) || index + 1,
          label,
          confidence: toConfidence(row["confidence"]),
          action,
          time: toTime(row["timestamp"] ?? row["time"]),
          size: toSize(row["size"], diameterMm),
          diameterMm,
          ripeness,
        } satisfies DetectionEvent,
      };
    })
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 40)
    .map((r) => r.event);
}

export function normalizeHardware(
  raw: unknown,
  fallback: HardwareComponent[],
): HardwareComponent[] {
  if (!raw || typeof raw !== "object") return fallback;
  const map = raw as Record<string, Record<string, unknown>>;

  const merged = fallback.map((c) => {
    const row = map[c.key];
    if (!row) return c;
    const state = String(row["state"] ?? "").toLowerCase();
    return {
      ...c,
      name: String(row["name"] ?? c.name),
      detail: String(row["detail"] ?? c.detail),
      state: (state === "offline" || state === "standby" || state === "online"
        ? state
        : c.state) as HardwareState,
    };
  });

  const extras = Object.entries(map)
    .filter(([key]) => !fallback.some((c) => c.key === key))
    .map(([key, row]) => ({
      key,
      name: String(row["name"] ?? key),
      detail: String(row["detail"] ?? ""),
      state: (String(row["state"] ?? "online").toLowerCase() as HardwareState) ?? "online",
    }));

  return [...merged, ...extras];
}
