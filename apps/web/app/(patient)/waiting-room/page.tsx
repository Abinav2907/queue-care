"use client";

import { AlertCircle, CheckCircle2, Loader2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { CurrentToken } from "@/components/waiting-room/CurrentToken";
import { EstimatedWaitTime } from "@/components/waiting-room/EstimatedWaitTime";
import { TokensAhead } from "@/components/waiting-room/TokensAhead";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { useQueue } from "@/hooks/useQueue";

export default function WaitingRoomPage() {
  const { queueState, loading, error, connected } = useQueue();
  const currentToken = queueState?.currentToken?.tokenNumber ?? null;
  const nextWaiting = queueState?.waitingPatients[0] ?? null;
  const tokensAhead = nextWaiting
    ? queueState?.waitingPatients.filter((patient) => patient.tokenNumber < nextWaiting.tokenNumber).length ?? 0
    : 0;
  const estimatedWait = tokensAhead * (queueState?.settings.avgConsultationTime ?? 0);
  const queuePosition = nextWaiting ? tokensAhead + 1 : null;

  return (
    <main className="min-h-screen overflow-hidden bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_38%),radial-gradient(circle_at_90%_20%,hsl(var(--accent)/0.13),transparent_30%)]" />
      <div className="relative mx-auto max-w-6xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Waiting Room
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Live Token Status
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm text-muted-foreground">
            <span className={`size-2 rounded-full ${connected ? "bg-primary" : "bg-destructive"}`} />
            {connected ? "Live" : "Offline"}
          </div>
        </motion.header>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="h-80 animate-pulse rounded-lg bg-white/[0.06]" />
            <div className="space-y-4">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-lg bg-white/[0.06]" />
              ))}
            </div>
          </div>
        ) : (
          <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <CurrentToken token={currentToken} />
            <div className="space-y-4">
              <TokensAhead value={tokensAhead} />
              <EstimatedWaitTime minutes={estimatedWait} />
              <Stat label="Queue Position" value={queuePosition ?? "--"} icon={MapPin} accent="text-accent" />
              <Card className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 text-primary" />
                  <div>
                    <p className="font-semibold">Live status updates</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      This screen updates automatically through Socket.IO when reception calls the next token.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
