import Link from "next/link";
import { ArrowRight, MonitorCheck, Stethoscope } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background px-6 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_76%_12%,hsl(var(--accent)/0.14),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center gap-8">
        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Queue Cure 26
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Real-time queue visibility for clinics.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A production-ready foundation for receptionist queue control and patient waiting room
            updates.
          </p>
        </section>

        <nav className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className="group rounded-lg border border-white/10 bg-surface/70 p-5 shadow-glow backdrop-blur-xl transition hover:-translate-y-0.5"
          >
            <MonitorCheck className="size-6 text-primary" />
            <span className="mt-4 flex items-center justify-between font-semibold">
              Receptionist Dashboard
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href="/waiting-room"
            className="group rounded-lg border border-white/10 bg-surface/70 p-5 shadow-glow backdrop-blur-xl transition hover:-translate-y-0.5"
          >
            <Stethoscope className="size-6 text-accent" />
            <span className="mt-4 flex items-center justify-between font-semibold">
              Patient Waiting Room
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </nav>
      </div>
    </main>
  );
}
