import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useBlightStream, type HardwareState } from "@/lib/useBlightStream";

export const Route = createFileRoute("/system")({
  head: () => ({
    meta: [
      { title: "System Status | BlightDetect+ IoT Hardware Monitor" },
      {
        name: "description",
        content:
          "Live status of the BlightDetect+ hardware: YOLO vision camera, Arduino Uno, conveyor belt, servo sorter, proximity sensors and power supply.",
      },
      { property: "og:title", content: "System Status | BlightDetect+" },
      {
        property: "og:description",
        content: "Monitor every IoT component of the tomato blight sorting line in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SystemPage,
});

const STATE_META: Record<HardwareState, { label: string; badge: string; dot: string }> = {
  online: {
    label: "Online / Active",
    badge: "border-success/30 bg-success/10 text-success",
    dot: "bg-success",
  },
  standby: {
    label: "Standby",
    badge: "border-warning/40 bg-warning/15 text-warning",
    dot: "bg-warning",
  },
  offline: {
    label: "Offline",
    badge: "border-primary/30 bg-primary/10 text-primary",
    dot: "bg-primary",
  },
};

function SystemPage() {
  return (
    <ClientOnly fallback={null}>
      <SystemView />
    </ClientOnly>
  );
}

function SystemView() {
  const { hardware } = useBlightStream();
  const online = hardware.filter((h) => h.state === "online").length;

  return (
    <AppShell title="System Status" subtitle="IoT hardware health across the sorting line">
      <div className="space-y-5 sm:space-y-6">
        <section className="card-surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 sm:p-6">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight sm:text-lg">Hardware Health</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {online} of {hardware.length} components active
            </p>
          </div>
          <p className="shrink-0 text-3xl font-extrabold tabular-nums sm:text-4xl">
            {hardware.length ? Math.round((online / hardware.length) * 100) : 0}%
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hardware.map((c) => {
            const meta = STATE_META[c.state];
            return (
              <article key={c.key} className="card-surface min-w-0 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                  <p className="min-w-0 truncate text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {c.detail}
                  </p>
                </div>
                <h3 className="mt-2 text-base font-bold tracking-tight">{c.name}</h3>
                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.badge}`}
                >
                  {meta.label}
                </span>
              </article>
            );
          })}
        </div>

        <section className="card-surface min-w-0 p-4 sm:p-6">
          <h2 className="text-base font-bold tracking-tight">Legend</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(STATE_META) as HardwareState[]).map((k) => (
              <span
                key={k}
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATE_META[k].badge}`}
              >
                {STATE_META[k].label}
              </span>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
