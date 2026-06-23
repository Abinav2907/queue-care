"use client";

import { motion } from "framer-motion";
import { Activity, Clock, UsersRound } from "lucide-react";
import { CurrentToken } from "@/components/waiting-room/CurrentToken";
import { useQueue } from "@/hooks/useQueue";

export default function TvDisplayPage() {
  const { queueState, connected } = useQueue();
  const currentToken = queueState?.currentToken?.tokenNumber ?? null;
  const nextTokens = queueState?.waitingPatients.slice(0, 6) ?? [];

  return (
    <main className="min-h-screen overflow-hidden bg-background p-8 text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.22),transparent_40%),radial-gradient(circle_at_90%_20%,hsl(var(--accent)/0.14),transparent_32%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="flex flex-col justify-center">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                Queue Cure 26
              </p>
              <h1 className="mt-2 text-5xl font-black tracking-tight">Waiting Hall Display</h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-lg text-muted-foreground">
              <span className={`size-3 rounded-full ${connected ? "bg-primary" : "bg-destructive"}`} />
              {connected ? "Live" : "Offline"}
            </div>
          </div>
          <CurrentToken token={currentToken} />
        </section>

        <section className="rounded-lg border border-white/10 bg-surface/70 p-6 shadow-glow backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <UsersRound className="size-7 text-accent" />
            <h2 className="text-3xl font-bold">Next Tokens</h2>
          </div>
          <div className="space-y-4">
            {nextTokens.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] p-5"
              >
                <div>
                  <p className="text-4xl font-black text-foreground">{patient.tokenNumber}</p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">{patient.priority}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{patient.patientName}</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    {queueState?.settings.avgConsultationTime ?? 0} min avg
                  </p>
                </div>
              </motion.div>
            ))}
            {!nextTokens.length ? (
              <div className="flex min-h-80 flex-col items-center justify-center text-center text-muted-foreground">
                <Activity className="size-10" />
                <p className="mt-3 text-lg">No waiting tokens</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
