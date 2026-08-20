import { useEffect, useState } from "react";
import { FIREBASE_ENABLED } from "./firebase";

export type Classification = "Healthy" | "Early Blight" | "Late Blight";
export type HardwareState = "online" | "offline" | "standby";
export type SizeGrade = "Small" | "Medium" | "Large";
export type Ripeness = "Ripe" | "Unripe";

export interface DetectionEvent {
  id: number;
  label: Classification;
  confidence: number;
  action: "Accepted" | "Rejected";
  time: string;
  size: SizeGrade;
  diameterMm: number;
  ripeness: Ripeness;
}

export interface HardwareComponent {
  key: string;
  name: string;
  detail: string;
  state: HardwareState;
}

const LABELS: Classification[] = ["Healthy", "Healthy", "Healthy", "Early Blight", "Late Blight"];

const INITIAL_HARDWARE: HardwareComponent[] = [
  { key: "camera", name: "YOLO Vision Camera", detail: "Laptop webcam · 30 FPS inference", state: "online" },
  { key: "arduino", name: "Arduino Uno", detail: "Serial COM3 · 9600 baud", state: "online" },
  { key: "conveyor", name: "Conveyor Belt", detail: "Motor driver · 0.4 m/s", state: "online" },
  { key: "servo", name: "Servo Motor (Sorter)", detail: "Reject gate · 0°/90°", state: "standby" },
  { key: "sensors", name: "Proximity Sensors", detail: "IR pair · entry & exit", state: "online" },
  { key: "power", name: "Power Supply", detail: "12V 5A regulated", state: "online" },
];

function stamp(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function makeEvent(id: number): DetectionEvent {
  const label = LABELS[Math.floor(Math.random() * LABELS.length)]!;
  const diameterMm = Math.round(38 + Math.random() * 45);
  const size: SizeGrade = diameterMm < 52 ? "Small" : diameterMm < 68 ? "Medium" : "Large";
  return {
    id,
    label,
    confidence: Math.round((0.82 + Math.random() * 0.17) * 100),
    action: label === "Healthy" ? "Accepted" : "Rejected",
    time: stamp(new Date()),
    size,
    diameterMm,
    ripeness: Math.random() > 0.28 ? "Ripe" : "Unripe",
  };
}

/**
 * Mock realtime stream. Mirrors the shape of a Firebase Realtime Database /
 * Firestore subscription so the listeners can be swapped in one place once
 * FIREBASE_ENABLED is true.
 */
export function useBlightStream() {
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [hardware, setHardware] = useState<HardwareComponent[]>(INITIAL_HARDWARE);
  const [nextId, setNextId] = useState(401);

  useEffect(() => {
    if (FIREBASE_ENABLED) {
      // TODO: onValue(ref(db, 'detections'), snap => setEvents(...))
      return;
    }
    const seed = Array.from({ length: 8 }, (_, i) => makeEvent(400 - i));
    setEvents(seed);

    let id = 401;
    const feed = setInterval(() => {
      const evt = makeEvent(id++);
      setNextId(id);
      setEvents((prev) => [evt, ...prev].slice(0, 40));
      setHardware((prev) =>
        prev.map((c) =>
          c.key === "servo"
            ? { ...c, state: evt.action === "Rejected" ? "online" : "standby" }
            : c,
        ),
      );
    }, 2600);

    const health = setInterval(() => {
      setHardware((prev) =>
        prev.map((c) => {
          if (c.key === "servo") return c;
          const roll = Math.random();
          if (roll > 0.96) return { ...c, state: "offline" };
          if (roll > 0.9) return { ...c, state: "standby" };
          return { ...c, state: "online" };
        }),
      );
    }, 7000);

    return () => {
      clearInterval(feed);
      clearInterval(health);
    };
  }, []);

  const total = events.length;
  const healthy = events.filter((e) => e.label === "Healthy").length;
  const blighted = total - healthy;
  const avgConfidence = total
    ? Math.round(events.reduce((s, e) => s + e.confidence, 0) / total)
    : 0;

  const countBy = <T extends string>(key: (e: DetectionEvent) => T, value: T) =>
    events.filter((e) => key(e) === value).length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  const small = countBy((e) => e.size, "Small");
  const medium = countBy((e) => e.size, "Medium");
  const large = countBy((e) => e.size, "Large");
  const ripe = countBy((e) => e.ripeness, "Ripe");
  const unripe = countBy((e) => e.ripeness, "Unripe");
  const avgDiameter = total
    ? Math.round(events.reduce((s, e) => s + e.diameterMm, 0) / total)
    : 0;

  return {
    events,
    hardware,
    nextId,
    metrics: {
      total,
      healthy,
      blighted,
      healthyPct: pct(healthy),
      blightPct: pct(blighted),
      avgConfidence,
      size: {
        small,
        medium,
        large,
        smallPct: pct(small),
        mediumPct: pct(medium),
        largePct: pct(large),
        avgDiameter,
      },
      ripeness: {
        ripe,
        unripe,
        ripePct: pct(ripe),
        unripePct: pct(unripe),
      },
    },
  };
}
