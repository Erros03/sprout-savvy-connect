import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { CheckCircle2, CircleAlert, Ruler, Sparkles, Boxes } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useBlightStream } from "@/lib/useBlightStream";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BlightDetect+ | Tomato Blight Detection & Yield Dashboard" },
      {
        name: "description",
        content:
          "Live AI and IoT dashboard for tomato blight detection, classification, automated sorting and yield monitoring powered by YOLO vision and Arduino hardware.",
      },
      { property: "og:title", content: "BlightDetect+ Yield Monitoring Dashboard" },
      {
        property: "og:description",
        content:
          "Track processed tomatoes, healthy yield, blight rejections and classification accuracy in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <ClientOnly fallback={null}>
      <DashboardView />
    </ClientOnly>
  );
}

function StatCard({
  label,
  value,
  note,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  tone: "neutral" | "success" | "danger";
  icon: typeof Boxes;
}) {
  const toneClass =
    tone === "success"
      ? "text-success border-success/30 bg-success/10"
      : tone === "danger"
        ? "text-primary border-primary/30 bg-primary/10"
        : "text-foreground border-border bg-muted";

  return (
    <article className="card-surface flex min-w-0 items-start gap-4 p-4 sm:p-5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </div>
    </article>
  );
}

function Bar({ label, pct, tone }: { label: string; pct: number; tone: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold">
        <span className="min-w-0 truncate uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <span className="shrink-0 tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${tone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface min-w-0 p-4 sm:p-6">
      <header className="mb-4">
        <h2 className="text-base font-bold tracking-tight sm:text-lg">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function Chip({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-border bg-background/60 px-3 py-3 text-center">
      <p className={`text-2xl font-extrabold tabular-nums ${tone}`}>{value}</p>
      <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function DashboardView() {
  const { events, metrics } = useBlightStream();
  const { size, ripeness } = metrics;

  return (
    <AppShell title="Yield Monitoring" subtitle="Real-time tomato grading and sorting line">
      <div className="space-y-5 sm:space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total processed"
            value={metrics.total}
            note="Since session start"
            tone="neutral"
            icon={Boxes}
          />
          <StatCard
            label="Healthy yield"
            value={metrics.healthy}
            note={`${metrics.healthyPct}% accepted by sorter`}
            tone="success"
            icon={CheckCircle2}
          />
          <StatCard
            label="Blight rejected"
            value={metrics.blighted}
            note={`${metrics.blightPct}% diverted by servo gate`}
            tone="danger"
            icon={CircleAlert}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Size Grading" subtitle={`Average diameter ${size.avgDiameter} mm`}>
            <div className="mb-5 flex gap-2 sm:gap-3">
              <Chip value={size.small} label="Small <52mm" tone="text-warning" />
              <Chip value={size.medium} label="Medium 52–67" tone="text-success" />
              <Chip value={size.large} label="Large ≥68mm" tone="text-foreground" />
            </div>
            <div className="space-y-3">
              <Bar label="Small" pct={size.smallPct} tone="bg-warning" />
              <Bar label="Medium" pct={size.mediumPct} tone="bg-success" />
              <Bar label="Large" pct={size.largePct} tone="bg-foreground" />
            </div>
          </Panel>

          <Panel title="Ripeness Monitoring" subtitle="Colour-based classification from the vision model">
            <div className="mb-5 flex gap-2 sm:gap-3">
              <Chip value={ripeness.ripe} label="Ripe" tone="text-primary" />
              <Chip value={ripeness.unripe} label="Unripe" tone="text-success" />
            </div>
            <div className="space-y-3">
              <Bar label="Ripe" pct={ripeness.ripePct} tone="bg-primary" />
              <Bar label="Unripe" pct={ripeness.unripePct} tone="bg-success" />
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <Panel
            title="Classification Breakdown"
            subtitle={`YOLO average confidence ${metrics.avgConfidence}%`}
          >
            <div className="space-y-4">
              <Bar label="Healthy" pct={metrics.healthyPct} tone="bg-success" />
              <Bar label="Infected" pct={metrics.blightPct} tone="bg-primary" />
              <Bar label="Model confidence" pct={metrics.avgConfidence} tone="bg-warning" />
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4 shrink-0 text-warning" />
                <span className="min-w-0">
                  Inference running at 30 FPS on the laptop webcam feed.
                </span>
              </div>
            </div>
          </Panel>

          <Panel title="Live Sorting Feed" subtitle="Most recent detections from the conveyor">
            <ul className="divide-y divide-border">
              {events.slice(0, 12).map((e) => (
                <li
                  key={e.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      #{e.id} — {e.label}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Ruler className="h-3 w-3" />
                        {e.size} · {e.diameterMm}mm
                      </span>
                      <span>{e.ripeness}</span>
                      <span className="tabular-nums">{e.confidence}%</span>
                      <span className="tabular-nums">{e.time}</span>
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      e.action === "Accepted"
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-primary/30 bg-primary/10 text-primary"
                    }`}
                  >
                    {e.action}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
