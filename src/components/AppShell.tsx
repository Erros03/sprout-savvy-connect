import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Cpu, LayoutDashboard, Leaf, Menu, X } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", note: "Yield monitoring", icon: LayoutDashboard },
  { to: "/system", label: "System Status", note: "IoT hardware", icon: Cpu },
] as const;

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-brand)] shadow-[var(--shadow-glow)]">
        <Leaf className="h-5 w-5 text-primary-foreground" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-extrabold tracking-tight text-foreground">
          BlightDetect<span className="text-primary">+</span>
        </span>
        <span className="block truncate text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          AI · IoT sorting line
        </span>
      </span>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1.5">
      {NAV.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors ${
              active
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
            }`}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                active
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-border bg-muted text-muted-foreground group-hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{item.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.note}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col gap-8 border-r border-border bg-sidebar px-5 py-6 lg:flex">
        <Brand />
        <NavLinks />
        <div className="mt-auto rounded-2xl border border-border bg-card p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            AI &amp; IoT based tomato blight detection, classification, sorting and yield
            monitoring system.
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-8 border-r border-border bg-sidebar px-5 py-6 shadow-[var(--shadow-elevated)]">
            <div className="flex items-start justify-between gap-3">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:py-4">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight sm:text-xl">{title}</h1>
              {subtitle && (
                <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
              )}
            </div>
            <span className="inline-flex shrink-0 justify-self-end items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Live stream</span>
              <span className="sm:hidden">Live</span>
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
